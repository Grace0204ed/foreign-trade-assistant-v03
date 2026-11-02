// List projections deliberately exclude image data and full template snapshots.
// Opening a record still uses /api/quotations/:id and its original snapshot.
module.exports = function quotationHistory(db, query = {}) {
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 30));
  const where = ["COALESCE(json_extract(q.settings_snapshot_json,'$._quoteMeta.documentExtras.recordClass'),'history')<>'draft'"], args = [];
  const status = String(query.status || 'active');
  if(Array.isArray(query.ids)){if(!query.ids.length)where.push('0');else{where.push(`q.id IN (${query.ids.map(()=>'?').join(',')})`);args.push(...query.ids);}}
  if (status === 'active') where.push("q.status NOT IN ('Void','Deleted')");
  if (status === 'void' || status === 'deleted') { where.push('q.status=?'); args.push(status === 'void' ? 'Void' : 'Deleted'); }
  if (query.date) { where.push('q.quote_date=?'); args.push(String(query.date)); }
  if (query.type) {
    where.push("COALESCE(json_extract(q.settings_snapshot_json,'$._quoteMeta.documentType'),'quotation')=?");
    args.push(String(query.type));
  }
  if (String(query.q || '').trim()) {
    // instr treats %, _ and quotes as literal search text, not SQL patterns.
    where.push(`(instr(lower(q.quote_number || ' ' || q.buyer_json || ' ' || q.terms_json),?)>0 OR EXISTS
      (SELECT 1 FROM quotation_items i WHERE i.quotation_id=q.id AND instr(lower(
        COALESCE(json_extract(i.product_snapshot_json,'$.productName'),'') || ' ' ||
        COALESCE(json_extract(i.product_snapshot_json,'$.machineCategory'),'') || ' ' ||
        COALESCE(json_extract(i.product_snapshot_json,'$.brand'),'') || ' ' ||
        COALESCE(json_extract(i.product_snapshot_json,'$.model'),'') || ' ' ||
        COALESCE(json_extract(i.price_snapshot_json,'$.values'),'')
      ),?)>0))`);
    const keyword = String(query.q).trim().toLowerCase(); args.push(keyword, keyword);
  }
  const clause = where.length ? ' WHERE ' + where.join(' AND ') : '';
  const total = db.prepare('SELECT COUNT(*) count FROM quotations q' + clause).get(...args).count;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pages, Math.max(1, parseInt(query.page, 10) || 1));
  const rows = db.prepare(`SELECT q.id,q.quote_number,q.quote_date,q.version,q.status,q.is_formal,q.total_amount,q.updated_at,
    q.buyer_json,q.terms_json,json_extract(q.settings_snapshot_json,'$._quoteMeta.documentType') document_type,
    json_extract(q.settings_snapshot_json,'$._quoteMeta.currency') currency
    FROM quotations q${clause} ORDER BY q.updated_at DESC,q.id DESC LIMIT ? OFFSET ?`).all(...args,pageSize,(page-1)*pageSize);
  const items = rows.length ? db.prepare(`SELECT quotation_id,id,product_id,
    json_extract(product_snapshot_json,'$.productName') productName,
    json_extract(product_snapshot_json,'$.machineCategory') machineCategory,
    json_extract(product_snapshot_json,'$.brand') brand,json_extract(product_snapshot_json,'$.model') model,
    COALESCE(json_extract(price_snapshot_json,'$.quantity'),json_extract(price_snapshot_json,'$.values.qty'),0) quantity,
    json_extract(price_snapshot_json,'$.currency') currency FROM quotation_items
    WHERE quotation_id IN (${rows.map(()=>'?').join(',')}) ORDER BY quotation_id,sort_order`).all(...rows.map(r=>r.id)) : [];
  const byId = new Map(rows.map(r=>[r.id,[]]));
  for (const i of items) byId.get(i.quotation_id).push({id:i.id,productId:i.product_id,
    productSnapshot:{productName:i.productName,machineCategory:i.machineCategory,brand:i.brand,model:i.model},
    priceSnapshot:{quantity:i.quantity,currency:i.currency}});
  return {quotations:rows.map(({buyer_json,terms_json,document_type,currency,...r})=>({...r,
    buyer:JSON.parse(buyer_json || '{}'),terms:JSON.parse(terms_json || '{}'),
    settingsSnapshot:{_quoteMeta:{documentType:document_type || 'quotation',currency}},items:byId.get(r.id)})),total,page,pages,pageSize};
};
