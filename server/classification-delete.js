const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const hierarchy = require('../assets/product-hierarchy');

// Every confirmation is bound to the complete current category/product state.
// The backup is a full SQLite backup, including history snapshots, not a partial export.
function createClassificationDeletion({db, backupDir}) {
  const read = () => {
    const settings = JSON.parse(db.prepare('SELECT data_json FROM company_settings WHERE id=1').get().data_json);
    const rows = db.prepare('SELECT * FROM products ORDER BY id').all();
    const products = rows.map(p => ({...p, values: JSON.parse(p.values_json || '{}')}));
    return {settings, products, rows};
  };
  const inspect = nodeId => {
    const state = read();
    const plan = hierarchy.deletionPlan(state.settings.productHierarchy, state.products, nodeId);
    const token = crypto.createHash('sha256').update(JSON.stringify([state.settings.productHierarchy, state.rows, plan])).digest('hex');
    return {...plan, categoryCount: plan.nodeIds.length, productCount: plan.productIds.length, token};
  };
  const execute = async (nodeId, token) => {
    const proposed = inspect(nodeId);
    if (!token || proposed.token !== token) throw Object.assign(new Error('分类或产品已变化，请重新确认删除范围。'), {status:409});
    fs.mkdirSync(backupDir, {recursive:true});
    const backupPath = path.join(backupDir, `before-classification-delete-${Date.now()}-${crypto.randomUUID()}.sqlite`);
    await db.backup(backupPath); // Failure aborts before any mutation.
    return db.transaction(() => {
      const current = inspect(nodeId);
      if (current.token !== token) throw Object.assign(new Error('备份期间资料已变化，请重新确认。'), {status:409});
      const {settings} = read(), timestamp = new Date().toISOString();
      settings.productHierarchy = hierarchy.applyDeletion(settings.productHierarchy, current, timestamp);
      const remove = db.prepare('DELETE FROM products WHERE id=?');
      for (const productId of current.productIds) remove.run(productId);
      db.prepare('UPDATE company_settings SET data_json=?,updated_at=? WHERE id=1').run(JSON.stringify(settings), timestamp);
      db.prepare('INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(crypto.randomUUID(),'local-owner','delete_classification','product_classification',nodeId,JSON.stringify(current),JSON.stringify({backupPath}),'用户确认连同下级分类及绑定产品删除',timestamp);
      return {settings, deletedProductIds:current.productIds, categoryCount:current.categoryCount, productCount:current.productCount, backupPath};
    })();
  };
  return {inspect, execute};
}
module.exports = {createClassificationDeletion};
