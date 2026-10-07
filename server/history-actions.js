const { randomUUID } = require('node:crypto');

function changeHistory(db, entries, action, userId = '') {
  if (!['delete', 'void', 'restore'].includes(action) || !Array.isArray(entries) || !entries.length || entries.length > 500) throw new Error('请选择1至500份报价及有效操作。');
  const unique = [...new Map(entries.map(e => [`${e.type}:${e.id}`, e])).values()];
  return db.transaction(() => {
    for (const entry of unique) {
      const table = { standard: 'quotations', vehicle: 'quote_versions' }[entry.type];
      if (!table || typeof entry.id !== 'string') throw new Error('报价类型或编号无效。');
      const row = db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(entry.id);
      if (!row) throw new Error('部分报价已不存在，请刷新后重试。');
      if (action === 'void' && row.status === 'Deleted') throw new Error('回收站中的报价不能作废，请先恢复。');
      if ((action === 'delete' && row.status === 'Deleted') || (action === 'void' && row.status === 'Void')) continue;
      let next = action === 'delete' ? 'Deleted' : 'Void';
      if (action === 'restore') {
        if (row.status !== 'Deleted') throw new Error('只能恢复回收站中的报价。');
        const prior = db.prepare("SELECT before_json FROM audit_logs WHERE entity_id=? AND action='history_delete' ORDER BY created_at DESC LIMIT 1").get(entry.id);
        next = prior ? JSON.parse(prior.before_json).status : (row.is_formal ? 'Formal' : 'Draft');
      }
      const now = new Date().toISOString();
      db.prepare(`UPDATE ${table} SET status=?,updated_at=? WHERE id=?`).run(next, now, entry.id);
      db.prepare('INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(randomUUID(), userId, `history_${action}`, entry.type, entry.id, JSON.stringify({status:row.status}), JSON.stringify({status:next}), '历史报价操作', now);
    }
    return unique.length;
  })();
}

function installHistoryActions(app, {db,requireLogin,ok,fail}) {
  app.post('/api/history/actions', requireLogin, (req,res) => {
    try { ok(res, {count:changeHistory(db,req.body.entries,req.body.action,req.session.user?.id || '')}); }
    catch(error) { fail(res,400,error.message,error.message); }
  });
}
module.exports = { changeHistory, installHistoryActions };
