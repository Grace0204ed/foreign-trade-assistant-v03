(function(root){
  'use strict';
  const labels={company:'客户公司名称|公司名称|客户公司|公司|企业|company name|my co name|company|organisation|organization|société',contact:'客户姓名|联系人姓名|联系人|负责人姓名|负责人|姓名|contact person|full name|customer name|contact|name|nom',phone:'联系电话|手机号码|手机号|手机|电话|微信|whatsapp|telephone|mobile|phone number|phone|tel',email:'电子邮箱|邮箱|邮件|e-mail|email',country:'所在国家|国家|country|pays',address:'公司地址|联系地址|地址|company address|contact address|address|adresse|add'};
  const aliases=Object.entries(labels).flatMap(([key,list])=>list.split('|').map(label=>({key,label}))).sort((a,b)=>b.label.length-a.label.length);
  const emailRE=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
  const countryNames=['China','Zambia','Zimbabwe','Tanzania','Namibia','Cameroon','Djibouti','Burundi','Nigeria','South Africa','Kenya','Uganda','Botswana','United States','中国','赞比亚','津巴布韦','坦桑尼亚','纳米比亚','喀麦隆','吉布提','布隆迪','尼日利亚','南非'];
  function parse(raw){
    const result={company:'',contact:'',phone:'',email:'',country:'',address:''},phones=[],plain=[];
    let text=String(raw||'').normalize('NFKC').replace(/&#x20;|&nbsp;/gi,' ').replace(/\\@/g,'@').replace(/[\u200b-\u200f\u202a-\u202e]/g,'').replace(/[🇦-🇿]/gu,'');
    // Common five-answer customer form: company, address, contact, phones, email.
    const numbered=[...text.matchAll(/(?:^|\s)([1-5])[.)、]\s*([\s\S]*?)(?=\s[1-5][.)、]|$)/g)];
    if(numbered.length===5&&numbered.every((m,i)=>Number(m[1])===i+1)&&/@/.test(numbered[4][2])&&/\d{6}/.test(numbered[3][2].replace(/[\s()+-]/g,''))){
      text=numbered.map((m,i)=>['Company','Address','Contact','Phone','Email'][i]+': '+m[2].trim()).join('\n');
    }
    // Label boundaries work for Chinese as well as Latin words; split multiple labelled fields on one line.
    const pattern=aliases.map(x=>x.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
    text=text.replace(new RegExp('(^|[\\s,，;；/])('+pattern+')\\s*[:：=]','gim'),'\n$2:');
    text=text.replace(/(?:^|\s)[1-9][.)、]\s*/g,'\n');
    const lines=text.split(/[\r\n;；]+/).map(s=>s.replace(/\s*(?:上午|下午)?\d{1,2}:\d{2}\s*$/,'').trim()).filter(Boolean);
    const addPhones=value=>{for(const m of value.matchAll(/(?:\+|00)?\d[\d ()-]{5,}\d/g)){const v=m[0].trim(),n=v.replace(/\D/g,'');if(n.length>=7&&n.length<=15&&!phones.some(p=>p.replace(/\D/g,'')===n))phones.push(v);}};
    let last='';
    for(const line of lines){
      let match=null;
      for(const a of aliases){const m=line.match(new RegExp('^'+a.label+'(?:\\s*[:：=]\\s*|\\s+)(.+)$','i'));if(m){match={key:a.key,value:m[1].trim()};break;}}
      if(match){last=match.key;const {key,value}=match;if(key==='phone')addPhones(value);else if(key==='email'){const e=value.match(emailRE);if(e)result.email=e.join(' / ');}else result[key]=value;continue;}
      const emails=line.match(emailRE);if(emails){result.email=[...new Set([...(result.email?result.email.split(' / '):[]),...emails])].join(' / ');const rest=line.replace(emailRE,'').trim();if(!rest)continue;}
      if(/^(?:\+|00)?[\d\s()+/,-]+$/.test(line)){addPhones(line);last='phone';continue;}
      if(/^(?:I\.?D\.?|passport|身份证|护照)\b/i.test(line)){last='';continue;}
      const country=countryNames.find(c=>line.toLowerCase()===c.toLowerCase());if(country){result.country=country;last='country';continue;}
      if(/\b(ltd\.?|limited|company|distributors?|trading|systems|group|inc\.?)\b|有限公司|贸易公司|公司$/i.test(line)&&!result.company){result.company=line;last='company';continue;}
      if(/\b(street|road|avenue|park|district|province|address|avenue|floor|building|box)\b|[省市区县路街号室]|^\d+\s+\p{L}/iu.test(line)||last==='address'){
        result.address=[result.address,line].filter(Boolean).join(', ');last='address';continue;
      }
      plain.push(line);last='';
    }
    for(const line of plain){
      if(!result.contact&&/^(?:[\p{L}.'’-]+\s+){1,4}[\p{L}.'’-]+$|^[\p{Script=Han}]{2,4}$/u.test(line)&&!line.includes(','))result.contact=line;
      else if(!result.address&&line.includes(','))result.address=line;
    }
    if(!result.country){const c=countryNames.find(c=>new RegExp('(?:^|[\\s,，])'+c+'(?:$|[\\s,，])','i').test(result.address));if(c)result.country=c;}
    result.phone=phones.join(' / ');return result;
  }
  if(typeof module==='object'&&module.exports)module.exports={parse};else root.CustomerTextParser={parse};
})(typeof window==='object'?window:globalThis);
