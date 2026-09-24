const $=id=>document.getElementById(id);
let mode='content', draft=null, workbookBytes=null, workbookName='', generation=0;
function status(message,kind='notice',target='status'){let e=$(target);e.className=kind;e.textContent=message}
function hideStatus(target='status'){$(target).className='hide'}
function switchMode(m){mode=m;generation++;draft=null;$('modeContent').classList.toggle('active',m==='content');$('modeTopics').classList.toggle('active',m==='topics');$('contentBrief').classList.toggle('hide',m!=='content');$('topicsBrief').classList.toggle('hide',m!=='topics');$('contentResult').classList.add('hide');$('topicsResult').classList.add('hide');$('draftBadge').classList.add('hide');$('empty').classList.remove('hide');$('generate').textContent=m==='topics'?'Suggest topics now':'Generate content now';hideStatus();hideStatus('saveStatus')}
$('modeContent').onclick=()=>switchMode('content');$('modeTopics').onclick=()=>switchMode('topics');
$('trackerFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let b=new Uint8Array(await f.arrayBuffer());await inspectWorkbook(b);workbookBytes=b;workbookName=f.name;$('trackerStatus').textContent='Loaded '+f.name+' · ready for approval';$('download').classList.add('hide');hideStatus('saveStatus')}catch(err){workbookBytes=null;status('Could not read this tracker: '+err.message,'error','saveStatus')}};
function brief(){return{pillar:$('pillar').value,format:$('format').value,platform:$('platform').value,audience:$('audience').value,language:$('language').value,topic:$('topic').value.trim(),scope:$('scope').value,context:$('context').value.trim(),theme:$('theme').value.trim(),count:+$('count').value}}
const PILLARS = [
  'Scam Prevention & Awareness', 'Safe Migration Information & Tips',
  'Safe Job-Seeking Tips', 'Learning Tips & Student Life',
  'Financial Management', 'Travel & Holiday Safety Tips'
];
const IDEAS = {
  [PILLARS[0]]: [
    ['Tin nhắn mượn tiền từ tài khoản người quen', 'Kiểm tra người gửi qua một kênh khác trước khi chuyển tiền'],
    ['Phòng trọ đẹp nhưng yêu cầu đặt cọc ngay', 'Kiểm tra địa chỉ và người cho thuê trước khi chuyển cọc'],
    ['Lời mời làm thêm yêu cầu gửi CCCD', 'Xác minh nhà tuyển dụng và mục đích thu thập giấy tờ'],
    ['Tài khoản giả danh cơ quan chức năng', 'Không làm theo cuộc gọi gây áp lực; tự tìm kênh liên hệ chính thức'],
    ['Lời mời tuyển mẫu ảnh thu phí trước', 'Kiểm tra đơn vị tuyển và điều kiện thanh toán'],
    ['Người quen qua mạng nhờ chuyển tiền gấp', 'Tạm dừng và xác minh câu chuyện qua kênh độc lập'],
    ['Đường link nhận quà yêu cầu đăng nhập', 'Kiểm tra tên miền trước khi nhập tài khoản']
  ],
  [PILLARS[1]]: [
    ['Ba việc cần kiểm tra trước khi nhận lời đi làm xa', 'Đối chiếu lộ trình, giấy tờ và chi phí'],
    ['Chuẩn bị giấy tờ trước khi đi học ở nước ngoài', 'Lập danh sách và sao lưu hồ sơ quan trọng'],
    ['Một lời hứa về visa nghe quá dễ', 'Kiểm tra yêu cầu trên trang chính thức'],
    ['Dự trù chi phí trước khi chuyển nơi sống', 'So sánh tiền nhà, đi lại và khoản dự phòng'],
    ['Tìm hỗ trợ khi gặp khó khăn ở nước ngoài', 'Lưu đầu mối hỗ trợ và thông tin liên hệ trước khi đi'],
    ['Đọc hợp đồng trước khi làm việc ở nước ngoài', 'Đối chiếu điều khoản với thông tin đã được tư vấn']
  ],
  [PILLARS[2]]: [
    ['Đọc tin tuyển dụng trước khi nộp hồ sơ', 'Kiểm tra tên công ty, công việc và kênh liên hệ'],
    ['Nhà tuyển dụng yêu cầu nộp tiền trước', 'Xác minh lý do thu phí và đừng vội chuyển tiền'],
    ['Hợp đồng thử việc có gì cần đọc kỹ', 'Xem công việc, lương, thời gian và điều kiện'],
    ['Phỏng vấn qua mạng nhưng không rõ công ty', 'Tìm thông tin công ty qua kênh độc lập'],
    ['Lời mời việc nhẹ lương cao', 'Kiểm tra yêu cầu công việc và điều kiện thực tế'],
    ['Bảo vệ thông tin cá nhân khi tìm việc', 'Chỉ chia sẻ giấy tờ khi biết rõ bên nhận']
  ],
  [PILLARS[3]]: [
    ['Lịch học bận rộn và một việc quan trọng mỗi ngày', 'Chọn một mục tiêu nhỏ có thể hoàn thành'],
    ['Mới lên thành phố học và chưa quen nhịp sống', 'Chuẩn bị thông tin nhà ở, đi lại và người hỗ trợ'],
    ['Kiểm tra học bổng có thật hay không', 'Đối chiếu thông báo với trang chính thức của đơn vị cấp'],
    ['Tìm nhóm học online an toàn', 'Kiểm tra người quản lý và điều kiện trước khi đóng phí'],
    ['Học kỹ năng mới mà không quá tải', 'Chọn một nguồn đáng tin và luyện tập đều đặn'],
    ['Khi bạn cần hỏi giúp đỡ ở môi trường mới', 'Xác định người và kênh hỗ trợ phù hợp']
  ],
  [PILLARS[4]]: [
    ['Ba khoản cần tính trước khi nhận lương', 'Ghi khoản thiết yếu, dự phòng và chi linh hoạt'],
    ['Tiết kiệm cho chuyến đi sắp tới', 'Chia mục tiêu thành các khoản nhỏ'],
    ['Mua sắm theo cảm xúc cuối tháng', 'Tạm dừng để xem lại ngân sách'],
    ['Chi phí ẩn khi chuyển nhà', 'Liệt kê đặt cọc, đi lại và vật dụng cần thiết'],
    ['Theo dõi khoản đăng ký tự động', 'Xem lại dịch vụ còn dùng và ngày gia hạn'],
    ['Quỹ dự phòng bắt đầu từ đâu', 'Chọn một khoản phù hợp với thu nhập của mình']
  ],
  [PILLARS[5]]: [
    ['Chuẩn bị trước chuyến đi xa', 'Kiểm tra giấy tờ, phương tiện và liên lạc'],
    ['Đặt phòng online trước kỳ nghỉ', 'Đối chiếu địa chỉ và chính sách qua kênh chính thức'],
    ['Giữ liên lạc khi đi một mình', 'Chia sẻ lịch trình với người tin cậy'],
    ['Lạc đường ở nơi mới', 'Chuẩn bị bản đồ và đầu mối hỗ trợ'],
    ['Bảo vệ giấy tờ khi di chuyển', 'Sao lưu và cất bản chính ở nơi an toàn'],
    ['Kế hoạch dự phòng khi lịch trình thay đổi', 'Lưu lựa chọn đi lại và liên hệ cần thiết']
  ]
};
const COPY = {
  [PILLARS[0]]: {
    vi: ['🚨 Một lời mời hấp dẫn vẫn cần được kiểm tra kỹ.', 'Tạm dừng trước khi chuyển tiền hoặc gửi giấy tờ.', 'Xác minh người gửi qua kênh liên hệ bạn tự tìm được.', 'Giữ lại tin nhắn và thông tin giao dịch nếu có điều bất thường.', 'Kiểm tra lại trước khi quyết định nhé.'],
    en: ['🚨 An appealing offer still deserves a careful check.', 'Pause before sending money or personal documents.', 'Verify the sender through a contact channel you found yourself.', 'Keep the messages and transaction details if something feels wrong.', 'Take a moment to check before deciding.']
  },
  [PILLARS[1]]: {
    vi: ['🌍 Chuẩn bị đi xa sẽ dễ hơn khi bạn kiểm tra từng bước.', 'Đối chiếu yêu cầu giấy tờ với nguồn chính thức.', 'Tính cả chi phí sinh hoạt và khoản dự phòng.', 'Lưu bản sao thông tin quan trọng và kênh hỗ trợ.', 'Chọn bước tiếp theo khi bạn đã có đủ thông tin.'],
    en: ['🌍 Preparing to move is easier when you check each step.', 'Compare document requirements with official sources.', 'Include living costs and an emergency reserve in your plan.', 'Keep copies of key information and support contacts.', 'Choose your next step once you have enough information.']
  },
  [PILLARS[2]]: {
    vi: ['📄 Một tin tuyển dụng rõ ràng sẽ chịu được vài câu hỏi.', 'Kiểm tra tên, địa chỉ và kênh liên hệ của đơn vị tuyển dụng.', 'Đọc kỹ công việc, thu nhập và điều kiện trước khi đồng ý.', 'Đừng vội gửi giấy tờ hoặc chuyển phí khi thông tin chưa rõ.', 'Xác minh trước, rồi hãy quyết định nộp hồ sơ.'],
    en: ['📄 A clear job offer can stand up to a few questions.', 'Check the employer’s name, address and contact channels.', 'Read the role, pay and conditions before agreeing.', 'Wait before sending documents or fees if details are unclear.', 'Verify the offer before applying.']
  },
  [PILLARS[3]]: {
    vi: ['📚 Một bước nhỏ hôm nay có thể giúp bạn bớt rối ngày mai.', 'Chọn một việc quan trọng để bắt đầu.', 'Tìm thông tin từ kênh đáng tin và ghi lại điều còn chưa rõ.', 'Hỏi người phù hợp khi bạn cần thêm góc nhìn.', 'Bắt đầu bằng việc bạn có thể làm ngay hôm nay.'],
    en: ['📚 One small step today can make tomorrow feel clearer.', 'Pick one useful task to start with.', 'Use a reliable source and note what remains unclear.', 'Ask someone you trust when you need another view.', 'Begin with one action you can take today.']
  },
  [PILLARS[4]]: {
    vi: ['💰 Nhìn rõ từng khoản giúp bạn chủ động hơn với tiền của mình.', 'Ghi lại những khoản cần chi trước.', 'Để riêng một khoản dự phòng phù hợp với hoàn cảnh của bạn.', 'Xem lại khoản chi linh hoạt trước khi mua thêm.', 'Thử bắt đầu bằng việc theo dõi chi tiêu tuần này.'],
    en: ['💰 Seeing each expense helps you make your own money choices.', 'Write down the costs you need to cover first.', 'Set aside a reserve that suits your situation.', 'Review flexible spending before buying more.', 'Start by tracking this week’s spending.']
  },
  [PILLARS[5]]: {
    vi: ['✈️ Một chuyến đi nhẹ đầu bắt đầu từ vài bước chuẩn bị.', 'Kiểm tra giấy tờ và cách di chuyển.', 'Lưu địa chỉ, thông tin đặt chỗ và số liên lạc cần thiết.', 'Chia sẻ lịch trình với người bạn tin cậy.', 'Dành ít phút kiểm tra lại trước khi lên đường.'],
    en: ['✈️ A smoother trip starts with a few checks.', 'Check your documents and travel plan.', 'Save your address, booking details and useful contacts.', 'Share your itinerary with someone you trust.', 'Take a final look before leaving.']
  }
};
const TAGS = {
  [PILLARS[0]]:'#canhgiacluadao', [PILLARS[1]]:'#safemigration',
  [PILLARS[2]]:'#timviecantoan', [PILLARS[3]]:'#kynangmoingay',
  [PILLARS[4]]:'#chitieuthongminh', [PILLARS[5]]:'#antoankhidulich'
};
let variation=0;
function choosePillar(b){
  if(b.pillar!=='Any')return b.pillar;
  let q=(b.topic||'').toLocaleLowerCase('vi');
  let clues=[['lừa|giả danh|mạo danh|lừa đảo|đặt cọc',PILLARS[0]],['visa|xuất cảnh|nước ngoài|di cư',PILLARS[1]],['tuyển dụng|tìm việc|phỏng vấn|hợp đồng',PILLARS[2]],['học|sinh viên|kỹ năng|học bổng',PILLARS[3]],['tiết kiệm|chi tiêu|ngân sách|tiền',PILLARS[4]],['du lịch|chuyến đi|đi lại|đặt phòng',PILLARS[5]]];
  return clues.find(([pattern])=>new RegExp(pattern,'i').test(q))?.[1]||PILLARS[variation%PILLARS.length];
}
function topicIdeas(b){
  let pillars=b.pillar==='Any'?PILLARS:[b.pillar];
  let pool=[];let max=Math.max(...pillars.map(p=>IDEAS[p].length));for(let i=0;i<max;i++)for(let p of pillars){let item=IDEAS[p][i];if(item)pool.push({topic:item[0],pillar:p,format:b.format==='TVC'?'AI Video':b.format,angle:item[1],research_need:'Verify any topic-specific current claim with an official source'})}if(pool.length<b.count){let originals=[...pool],frames=['3 bước kiểm tra: ','Trước khi quyết định: ','Điều nên hỏi về: '];for(let frame of frames){for(let item of originals){if(pool.length>=b.count)break;pool.push({...item,topic:frame+item.topic})}}}
  let theme=(b.theme||'').toLocaleLowerCase('vi').trim();
  if(theme){let hits=pool.filter(x=>(x.topic+' '+x.angle).toLocaleLowerCase('vi').includes(theme));pool=[...hits,...pool.filter(x=>!hits.includes(x))]}
  let offset=variation++%pool.length;pool=[...pool.slice(offset),...pool.slice(0,offset)];
  return {topics:pool.slice(0,b.count)};
}
function makeDraft(b){
  variation++;
  let pillar=choosePillar(b),item=IDEAS[pillar][variation%IDEAS[pillar].length];
  let topic=b.topic||item[0],lang=b.language,format=b.format;
  let v=COPY[pillar].vi,e=COPY[pillar].en;
  let viCaption=[`${v[0]}\n${topic}.`, ...v.slice(1,4).map((x,i)=>['🔍 ','📌 ','🛡️ '][i]+x),v[4],`#PAXU #vungbuoctuonglai ${TAGS[pillar]}`].join('\n');
  let enCaption=[`${e[0]}\n${topic}.`,...e.slice(1,4).map((x,i)=>['🔍 ','📌 ','🛡️ '][i]+x),e[4],`#PAXU #vungbuoctuonglai ${TAGS[pillar]}`].join('\n');
  let viScript=[`Có một việc cần kiểm tra trước khi quyết định: ${topic}.`,...v.slice(1,4).map(x=>x.replace(/^[^\p{L}]*/u,'')),v[4]].join('\n');
  let enScript=[`Before you decide, take a closer look at this: ${topic}.`,...e.slice(1,4).map(x=>x.replace(/^[^\p{L}]*/u,'')),e[4]].join('\n');
  let caption=lang==='English'?enCaption:lang==='Bilingual'?viCaption+'\n\n'+enCaption:viCaption;
  let script=lang==='English'?enScript:lang==='Bilingual'?viScript+'\n\nEnglish version:\n'+enScript:viScript;
  let voLines=lang==='English'?e: v;
  let shotList=voLines.map((line,i)=>`Shot ${i+1} (0–10s): ${i===0?'Person notices the situation':i===4?'Person takes a considered next step':'Person checks one piece of information'}; voiceover: ${line.replace(/^[^\p{L}]*/u,'')}`).join('\n');
  let voiceover=voLines.map(line=>line.replace(/^[^\p{L}]*/u,'')).join('\n');
  let result={topic,pillar,hook:voLines[0],caption,script:'',shot_list:'',voiceover:'',on_screen_text:'',visual_brief:'',cta:voLines[4],hashtags:`#PAXU #vungbuoctuonglai ${TAGS[pillar]}`,source_note:'Starter draft made from evergreen writing patterns. Verify any topic-specific current claim and source before publishing.'};
  if(b.scope==='caption')return result;
  if(b.scope==='script'){result.caption='';result.script=script;return result}
  if(format==='Reels'){result.script=script;result.caption=caption.split('\n').slice(0,2).join('\n')+'\n'+voLines[4]+'\n'+result.hashtags}
  else if(format==='AI Video'||format==='TVC'){result.shot_list=shotList;result.voiceover=voiceover;result.caption=caption.split('\n').slice(0,2).join('\n')+'\n'+result.hashtags}
  else if(format==='Graphic'){result.visual_brief=`Main message: ${topic}. Show three concise checks in the visual; keep the caption as supporting context.`}
  else if(format==='News Post'){result.source_note='News format selected. This draft does not claim a specific event happened. Add a current, verified event and a direct official source before publishing.'}
  return result;
}
$('generate').onclick=()=>{
  const b=brief();
  if(mode==='content'&&!b.topic&&b.pillar==='Any')return status('Choose a category or enter a topic.','warn');
  try{
    if(mode==='topics')showTopics(topicIdeas(b));
    else showContent(makeDraft(b),b);
    status(mode==='topics'?'Topic ideas ready. Choose one to create a draft.':'Starter draft ready. Edit and verify it before approval.');
  }catch(err){status('Could not prepare a draft: '+err.message,'error')}
};
function showTopics(r){if(!Array.isArray(r.topics))throw Error('Topics response could not be read. Try again.');$('empty').classList.add('hide');let box=$('topicsResult');box.replaceChildren();let h=document.createElement('h3');h.textContent=r.topics.length+' topic ideas';box.append(h);r.topics.forEach((t,i)=>{let d=document.createElement('div');d.className='topic';let strong=document.createElement('strong');strong.textContent=(i+1)+'. '+(t.topic||'Untitled');let meta=document.createElement('small');meta.textContent=[t.pillar,t.format].filter(Boolean).join(' · ');let p=document.createElement('p');p.textContent=t.angle||'';let n=document.createElement('small');n.textContent=t.research_need&&t.research_need!=='none'?'Research: '+t.research_need:'';let pick=document.createElement('button');pick.type='button';pick.className='action secondary';pick.textContent='Use this topic';pick.onclick=()=>{$('topic').value=t.topic||'';if(t.pillar&&[...$('pillar').options].some(o=>o.value===t.pillar))$('pillar').value=t.pillar;if(t.format&&[...$('format').options].some(o=>o.value===t.format))$('format').value=t.format;switchMode('content')};d.append(strong,meta,p,n,document.createElement('br'),pick);box.append(d)});box.classList.remove('hide')}
function showContent(r,b){draft={...r,topic:b.topic||String(r.topic||'').trim(),pillar:b.pillar==='Any'?(r.pillar||''):b.pillar,format:b.format,platform:b.platform,audience:b.audience,language:b.language,scope:b.scope};let box=$('outputFields');box.replaceChildren();let labels={caption:'Caption',script:'Script',shot_list:'Shot list',voiceover:'Voiceover',on_screen_text:'On-screen text',visual_brief:'Visual brief',cta:'CTA',hashtags:'Hashtags',source_note:'Research note'};let visible=b.scope==='caption'?['caption']:b.scope==='script'?['script']:b.format==='Reels'?['script','caption']:['caption','script','shot_list','voiceover','on_screen_text','visual_brief'];visible.push('cta','hashtags','source_note');for(let key of visible){if(!String(r[key]||'').trim()&&!['caption','script'].includes(key))continue;let wrap=document.createElement('div');wrap.className='field';let lab=document.createElement('label');lab.textContent=labels[key];lab.htmlFor='edit_'+key;let ta=document.createElement('textarea');ta.id='edit_'+key;ta.value=r[key]||'';ta.rows=key==='caption'||key==='script'?8:3;ta.oninput=()=>{draft[key]=ta.value;$('download').classList.add('hide');hideStatus('saveStatus')};wrap.append(lab,ta);box.append(wrap)}$('empty').classList.add('hide');$('contentResult').classList.remove('hide');$('draftBadge').classList.remove('hide');$('draftBadge').textContent='Draft · not saved';hideStatus('saveStatus')}
const NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';function kids(node,local){return [...node.children].filter(e=>e.localName===local)}function cellValue(c,shared){if(!c)return'';if(c.getAttribute('t')==='inlineStr')return [...c.getElementsByTagNameNS(NS,'t')].map(n=>n.textContent).join('');let v=c.getElementsByTagNameNS(NS,'v')[0]?.textContent||'';return c.getAttribute('t')==='s'?shared[+v]||'':v}function colCell(row,col){return kids(row,'c').find(c=>c.getAttribute('r')===col+row.getAttribute('r'))}function getRows(sheet){let data=sheet.getElementsByTagNameNS(NS,'sheetData')[0];return{data,rows:kids(data,'row')}}function parseXML(str){let d=new DOMParser().parseFromString(str,'application/xml');if(d.getElementsByTagName('parsererror').length)throw Error('Invalid workbook XML');return d}
async function inspectWorkbook(bytes){if(typeof JSZip==='undefined')throw Error('Excel component could not load');let zip=await JSZip.loadAsync(bytes);let path='xl/worksheets/sheet1.xml';if(!zip.file(path))throw Error('Content Tracker sheet was not found');let book=parseXML(await zip.file('xl/workbook.xml').async('string'));let names=[...book.getElementsByTagNameNS(NS,'sheet')].map(x=>x.getAttribute('name'));if(names[0]!=='Content Tracker')throw Error('Expected Content Tracker as first worksheet');let xml=parseXML(await zip.file(path).async('string')),shared=[];if(zip.file('xl/sharedStrings.xml')){let ss=parseXML(await zip.file('xl/sharedStrings.xml').async('string'));shared=[...ss.getElementsByTagNameNS(NS,'si')].map(si=>[...si.getElementsByTagNameNS(NS,'t')].map(t=>t.textContent).join(''))}let {rows}=getRows(xml),head=rows.find(r=>r.getAttribute('r')==='1');if(!head||cellValue(colCell(head,'G'),shared)!=='Topic'||cellValue(colCell(head,'K'),shared)!=='Caption')throw Error('This is not the expected PAXU tracker');return{zip,xml,rows,shared,path}}
function setCell(doc,row,col,value){let r=row.getAttribute('r'),c=colCell(row,col);if(!c){c=doc.createElementNS(NS,'c');c.setAttribute('r',col+r);let index=col.charCodeAt(0);let next=kids(row,'c').find(x=>x.getAttribute('r').charCodeAt(0)>index);row.insertBefore(c,next||null)}if(value==='')return;c.removeAttribute('t');while(c.firstChild)c.removeChild(c.firstChild);c.setAttribute('t','inlineStr');let is=doc.createElementNS(NS,'is'),t=doc.createElementNS(NS,'t');t.setAttribute('xml:space','preserve');t.textContent=String(value);is.append(t);c.append(is)}
function normalize(s){return String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi')}
function buildId(rows,shared){let used=new Set(rows.map(r=>cellValue(colCell(r,'A'),shared)));let n=1,id;do{id='PAXU-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+String(n++).padStart(3,'0')}while(used.has(id));return id}
async function updateTracker(){let {zip,xml,rows,shared,path}=await inspectWorkbook(workbookBytes),match=rows.filter(r=>+r.getAttribute('r')>1&&normalize(cellValue(colCell(r,'G'),shared))===normalize(draft.topic));if(match.length>1)throw Error('Several tracker rows match this topic. Choose a more specific topic before saving.');let target=match[0];if(target&&cellValue(colCell(target,'K'),shared).trim())throw Error('This topic already has a caption in the tracker. Existing content has been protected.');if(target&&cellValue(colCell(target,'R'),shared).includes('Script:'))throw Error('This topic already has a script in the tracker. Existing content has been protected.');if(!target){target=rows.find(r=>+r.getAttribute('r')>1&&!['A','G','K','R'].some(c=>cellValue(colCell(r,c),shared).trim()));if(!target){let {data}=getRows(xml),max=Math.max(...rows.map(r=>+r.getAttribute('r')));target=xml.createElementNS(NS,'row');target.setAttribute('r',String(max+1));data.append(target)}setCell(xml,target,'A',buildId(rows,shared));setCell(xml,target,'G',draft.topic);setCell(xml,target,'C',draft.platform);setCell(xml,target,'D',draft.language);setCell(xml,target,'E',draft.pillar);setCell(xml,target,'H',draft.format);setCell(xml,target,'I',draft.audience);setCell(xml,target,'P','Draft')}
const guarded=(col,val)=>{if(val&&!cellValue(colCell(target,col),shared).trim())setCell(xml,target,col,val)};
guarded('J',draft.hook);guarded('K',draft.caption);guarded('L',draft.cta);guarded('M',draft.hashtags);guarded('N',draft.source_note);guarded('O',draft.shot_list||draft.visual_brief);let detail=[draft.script&&'Script:\n'+draft.script,draft.voiceover&&'Voiceover:\n'+draft.voiceover,draft.on_screen_text&&'On-screen text:\n'+draft.on_screen_text].filter(Boolean).join('\n\n');if(detail){let existingNotes=cellValue(colCell(target,'R'),shared).trim();if(existingNotes&&!existingNotes.includes('Script:')&&!existingNotes.includes('Voiceover:'))setCell(xml,target,'R',existingNotes+'\n\n'+detail);else guarded('R',detail)}if(['','Pending','Changes Requested'].includes(cellValue(colCell(target,'Q'),shared).trim()))setCell(xml,target,'Q','Approved');let orig=rows.filter(r=>cellValue(colCell(r,'A'),shared).trim()).map(r=>cellValue(colCell(r,'A'),shared));zip.file(path,new XMLSerializer().serializeToString(xml));let changed=new Uint8Array(await zip.generateAsync({type:'uint8array',compression:'DEFLATE'}));let verify=await inspectWorkbook(changed),ids=verify.rows.map(r=>cellValue(colCell(r,'A'),verify.shared));if(orig.some(x=>!ids.includes(x)))throw Error('Validation failed: an existing content ID is missing');let row=verify.rows.find(r=>r.getAttribute('r')===target.getAttribute('r'));if(draft.caption&&cellValue(colCell(row,'K'),verify.shared)!==draft.caption)throw Error('Validation failed: caption did not save');return{changed,row:+target.getAttribute('r')}}

function setExcelChoice(){let enabled=$('addToExcel').checked;$('excelOptions').classList.toggle('hide',!enabled);$('approve').textContent=enabled?'Approve & update Excel':'Approve content';$('download').classList.add('hide');hideStatus('saveStatus')}
$('addToExcel').onchange=setExcelChoice;
$('approve').onclick=async()=>{
  if(!draft)return;
  if(!draft.topic)return status('Choose a topic before approval.','warn','saveStatus');
  if(!(draft.caption||draft.script||'').trim())return status('Add a caption or script before approval.','warn','saveStatus');
  if(!$('addToExcel').checked){$('draftBadge').textContent='Approved · not added to Excel';status('Content approved. No workbook was changed.','notice','saveStatus');return}
  if(!workbookBytes)return status('Choose your current .xlsx tracker first.','warn','saveStatus');
  $('approve').disabled=true;
  try{
    let result=await updateTracker();workbookBytes=result.changed;
    workbookName=workbookName.replace(/_Approved_\d{4}-\d{2}-\d{2}/,'').replace(/\.xlsx$/i,'')+'_Approved_'+new Date().toISOString().slice(0,10)+'.xlsx';
    $('trackerStatus').textContent='Updated in this page: '+workbookName;
    $('download').classList.remove('hide');$('draftBadge').textContent='Approved · Excel ready';
    status('Added to row '+result.row+'. Download the updated workbook to keep it.','notice','saveStatus');
    $('download').click();
  }catch(err){status(err.message,'error','saveStatus')}
  finally{$('approve').disabled=false}
};
$('download').onclick=()=>{let url=URL.createObjectURL(new Blob([workbookBytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));let a=document.createElement('a');a.href=url;a.download=workbookName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)};
