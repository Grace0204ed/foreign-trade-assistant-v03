// Recovery snapshots are separate from business records and survive server-port changes.
module.exports = function installWorkDrafts(app, db) {
  db.exec(`CREATE TABLE IF NOT EXISTS work_drafts (
    owner TEXT NOT NULL, task_key TEXT NOT NULL, payload TEXT NOT NULL,
    saved_at TEXT NOT NULL, PRIMARY KEY(owner, task_key))`);
  const owner = req => req.session.user.id;
  app.get('/api/work-drafts', (req, res) => {
    const drafts = db.prepare('SELECT payload FROM work_drafts WHERE owner=? ORDER BY saved_at DESC').all(owner(req)).map(row => JSON.parse(row.payload));
    res.json({ok:true, drafts});
  });
  const put = (req, res) => {
    const row = req.body;
    if (!row || typeof row.key !== 'string' || row.key.length > 250 ||
        !['quote','products','invitation','agency'].includes(row.kind) || !row.data || typeof row.data !== 'object' ||
        (req.params.key && row.key !== req.params.key)) return res.status(400).json({ok:false,message:'草稿格式无效'});
    // A delayed unload beacon must never replace a newer acknowledged edit.
    const previous=db.prepare('SELECT payload FROM work_drafts WHERE owner=? AND task_key=?').get(owner(req),row.key);
    if(previous&&Number(JSON.parse(previous.payload).revision||0)>Number(row.revision||0))return res.json({ok:true,stale:true});
    const payload = JSON.stringify({...row, user:owner(req)});
    db.prepare(`INSERT INTO work_drafts(owner,task_key,payload,saved_at) VALUES(?,?,?,?)
      ON CONFLICT(owner,task_key) DO UPDATE SET payload=excluded.payload,saved_at=excluded.saved_at`).run(owner(req), row.key, payload, new Date().toISOString());
    res.json({ok:true});
  };
  app.put('/api/work-drafts/:key', put);
  app.post('/api/work-drafts', put); // sendBeacon on browser shutdown
  app.delete('/api/work-drafts/:key', (req,res) => {
    db.prepare('DELETE FROM work_drafts WHERE owner=? AND task_key=?').run(owner(req),req.params.key);
    res.json({ok:true});
  });
};
