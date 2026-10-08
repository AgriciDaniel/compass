// Real browser DOM, synthetic vault only. No personal notes or providers.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const screenshotDir = path.resolve(process.env.SCREENSHOT_DIR || "/tmp");
fs.mkdirSync(screenshotDir, { recursive: true });
const screenshotPath = (name) => path.join(screenshotDir, name);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent('<html><body style="margin:0;font:14px Arial;background:#17191c;color:#ddd"><div id="root" style="height:100vh;overflow:auto"></div><div role="note" style="position:fixed;bottom:0;z-index:9999;background:#10242d;padding:4px 8px;font-size:10px;pointer-events:none">SYNTHETIC FIXTURE · No live vault or provider data</div></body></html>');
  await page.addStyleTag({ content: ':root{--background-primary:#17191c;--background-secondary:#202328;--text-normal:#ddd;--text-muted:#a5abb3;--text-faint:#777;--background-modifier-border:#393d44;--interactive-accent:#ff906b;--font-interface:Arial;--font-text:Arial}button,input,select{font:inherit;color:inherit;background:#252a31;border:1px solid #454c55}button{cursor:pointer}' + fs.readFileSync('.obsidian/plugins/life-os-app/styles.css','utf8') });
  await page.evaluate(async (source) => {
    HTMLElement.prototype.empty=function(){this.replaceChildren();};
    HTMLElement.prototype.addClass=function(...names){this.classList.add(...names);};
    HTMLElement.prototype.setText=function(text){this.textContent=text;};
    HTMLElement.prototype.createEl=function(tag,options={}){const el=document.createElement(tag);if(options.cls)el.className=options.cls;if(options.text)el.textContent=options.text;for(const[k,v]of Object.entries(options.attr||{}))el.setAttribute(k,v);this.appendChild(el);return el;};
    HTMLElement.prototype.createDiv=function(options){return this.createEl('div',options);};
    HTMLElement.prototype.createSpan=function(options){return this.createEl('span',options);};
    const now='2026-09-09';
    function moment(value=now){const date=new Date(`${value}T12:00:00Z`);return {clone:()=>moment(date.toISOString().slice(0,10)),subtract(n){date.setUTCDate(date.getUTCDate()-n);return this;},format(f){const iso=date.toISOString().slice(0,10);return ({'YYYY-MM-DD':iso,'YYYY-MM':iso.slice(0,7),'gggg-[W]ww':'2026-W37','YYYY-[Q]Q':'2026-Q3','[Week] ww':'Week 37','D MMM':`${date.getUTCDate()} Sep`,'ddd':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getUTCDay()]})[f]||iso;}};}
    moment.localeData=()=>({firstDayOfWeek:()=>1});
    class TFile{constructor(path){this.path=path;this.basename=path.split('/').pop().replace(/\.md$/,'');this.extension='md';}}
    class Component{constructor(){this.disposers=[];}registerDomEvent(el,event,fn,options){el.addEventListener(event,fn,options);this.disposers.push(()=>el.removeEventListener(event,fn,options));}registerEvent(){}addChild(child){child.onload?.();}removeChild(child){child.onunload?.();child.disposers.forEach(fn=>fn());}}
    class ItemView extends Component{constructor(leaf){super();this.app=leaf.app;this.contentEl=document.querySelector('#root');}}
    const files=new Map(), metadata=new Map(), contents=new Map();
    const add=(path,data={},body='')=>{files.set(path,new TFile(path));metadata.set(path,{frontmatter:data,listItems:body.split('\n').flatMap((line,i)=>{const m=line.match(/^- \[(.)\]/);return m?[{task:m[1],position:{start:{line:i}}}]:[];})});contents.set(path,body);};
    add('Meta/Compass Config.md',{questions:[{key:'dq_focus',text:'Did I focus on what matters?'}],habits:['habit_walk','habit_read']});
    add('00 Dashboards/Setup.md',{status:'open'});
    for(const name of ['Assistant','Task Dashboard','Projects Dashboard','Compass Dashboard','Boards'])add(`00 Dashboards/${name}.md`);
    for(let i=0;i<20;i++){const d=new Date('2026-09-09T12:00:00Z');d.setUTCDate(d.getUTCDate()-i);add(`01 Journal/Daily/${d.toISOString().slice(0,10)}.md`,{dq_focus:4+i%7,habit_walk:i%3!==0,habit_read:i%2===0});}
    add('02 Retreats/2026-Q3 Personal Retreat.md',{wheel_health:7,wheel_work:6,wheel_relationships:8});
    add('04 Projects/Synthetic project.md',{type:'project',status:'active'},'- [ ] Review synthetic plan #project/synthetic-project 📅 2026-09-09\n- [ ] Draft outline #project/synthetic-project ⏳ 2026-09-10');
    add('08 Tasks/Tasks.md',{},'- [ ] Resolve fixture overdue task 📅 2026-09-08\n- [ ] Pick a focus ⏫');
    add('05 People/Synthetic person.md',{type:'person'},'- [ ] Discuss fixture #p/synthetic-person #discuss');
    add('07 Library/Book Notes/Synthetic book.md',{type:'book'});
    add('07 Library/Book Notes/Finished book.md',{type:'book',status:'completed'});
    add('07 Library/Book Notes/Sample book.md',{type:'book',status:'reading',tags:['example']});
    add('07 Library/Source.md',{type:'source',cover:'https://example.invalid/cover.png'});
    const boardPath='06 Writing/Articles/Article Board.md';
    add(boardPath,{'kanban-plugin':'board'},'## Ideas\n- [ ] Fixture idea\n## Drafting\n- [ ] Fixture draft\n- [x] Fixture checked item');
    metadata.get(boardPath).headings=[{level:2,heading:'Ideas',position:{start:{line:0}}},{level:2,heading:'Drafting',position:{start:{line:2}}}];
    window.opened=[];window.commands=[];
    const plugins={'agent-client':{settings:{autoAllowPermissions:false}},'obsidian-local-rest-api':{settings:{}}};
    const app={vault:{getMarkdownFiles:()=>[...files.values()],getAbstractFileByPath:p=>files.get(p),cachedRead:async f=>contents.get(f.path)||'',on(){}},metadataCache:{getFileCache:f=>metadata.get(f.path),on(){}},plugins:{getPlugin:id=>plugins[id]},workspace:{getLeaf:()=>({openFile:async(f,o)=>window.opened.push({path:f.path,options:o})}),revealLeaf:async()=>{}},commands:{commands:{}}};
    const module={exports:{}};
    const {View,navItems,modules}=new Function('require','module',`${source};return {View:LifeOSHomeView,navItems:NAV_ITEMS,modules:MODULES};`)(()=>({Component,ItemView,TFile,Plugin:class{},Modal:class{},Notice:class{},moment,setIcon(){}}),module);
    window.uiMessages={navItems,modules};
    const plugin=new module.exports();plugin.app=app;plugin.language='en';
    plugin.runCommand=(id)=>{window.commands.push(id);return true;};plugin.openCapture=()=>window.commands.push('capture');plugin.activateView=()=>{};
    window.savedLanguages=[];plugin.saveData=async data=>window.savedLanguages.push({...data});
    window.plugin=plugin;window.view=new View({app},plugin);
    app.workspace.getLeavesOfType=type=>type==='life-os-home'?[{view:window.view}]:[];
    window.addLocalizedFixture=()=>{
      add('04 Projects/Today.md',{type:'project',status:'active'},'- [ ] Today #project/today 📅 2026-09-09');
      add('05 People/Home.md',{type:'person'});
      metadata.get('Meta/Compass Config.md').frontmatter.questions=[{key:'dq_focus',text:'Home'}];
    };
    await window.view.onOpen();
  }, fs.readFileSync('.obsidian/plugins/life-os-app/main.js','utf8'));
  assert.equal(await page.getByRole('note').count(),1);
  assert.equal(await page.locator('.life-os-analytics').count(),0);
  assert.equal(await page.locator('.life-os-brain-preview canvas').count(),1);
  assert.equal(await page.locator('.life-os-brain-preview canvas').getAttribute('tabindex'),'-1');
  assert.equal(await page.locator('.life-os-brain-preview .life-os-brain-note').count(),0);
  assert.ok(await page.locator('.life-os-task-row').count() <= 3);
  await page.locator('.life-os-task-row').first().click();
  assert.ok(await page.evaluate(()=>window.opened.at(-1)?.options?.eState?.line >= 0));
  for(const screen of ['home','today','plan','review','focus','projects','people','create','library','ai']){
    await page.evaluate((s)=>{window.view.activeScreen=s;window.view.render();},screen);
    assert.ok(await page.locator('.life-os-shell').innerText());
    await page.screenshot({path:screenshotPath(`life-os-${screen}-candidate.png`),fullPage:true});
    if(screen==='home'){
      assert.equal(await page.locator('.life-os-shell > .life-os-summary, .life-os-shell > .life-os-ai-panel').count(),0);
      assert.ok(await page.evaluate(()=>{
        const children=[...document.querySelector('.life-os-shell').children];
        return children.slice(1).every((child,i)=>child.getBoundingClientRect().top-children[i].getBoundingClientRect().bottom>=19);
      }));
      await page.evaluate(()=>{const root=document.querySelector('#root');root.scrollTop=root.scrollHeight;});
      await page.screenshot({path:screenshotPath('life-os-home-lower-candidate.png')});
      await page.evaluate(()=>document.querySelector('#root').scrollTop=0);
    }
    if(screen==='today')assert.equal(await page.locator('.life-os-checkin-meter').getAttribute('max'),'3');
    if(screen==='projects')assert.ok((await page.locator('.life-os-record-metrics').textContent()).includes('2 tagged open'),await page.locator('.life-os-record-metrics').textContent());
    if(screen==='people'){
      await page.locator('.life-os-discussion-queue button').click();
      assert.equal(await page.evaluate(()=>window.opened.at(-1).path),'05 People/Synthetic person.md');
    }
    if(screen==='focus'){
      assert.ok(await page.locator('.life-os-workload-segment').count()>0);
      await page.getByRole('button',{name:'Overdue · 1',exact:true}).click();
      assert.equal(await page.locator('.life-os-task-row').count(),1);
      assert.ok((await page.locator('.life-os-task-row').innerText()).includes('overdue'));
      await page.getByRole('button',{name:/^All ·/}).click();
    }
    if(screen==='create'){
      await page.locator('.life-os-pipeline-card').filter({hasText:'Articles'}).click();
      assert.equal(await page.locator('.life-os-workflow-lanes').count(),1);
      assert.equal(await page.locator('.life-os-lane-item').count(),2);
      assert.equal(await page.getByRole('button',{name:'Ideas · 1',exact:true}).count(),1);
      await page.getByRole('button',{name:'Drafting · 2',exact:true}).click();
      assert.equal(await page.evaluate(()=>window.opened.at(-1).options.eState.line),2);
      await page.screenshot({path:screenshotPath('life-os-create-candidate.png'),fullPage:true});
    }
    if(screen==='library'){
      assert.equal(await page.locator('.life-os-record-card').count(),3);
      assert.equal(await page.locator('.life-os-book-fallback').count(),3);
      assert.equal(await page.locator('img[src^="https:"]').count(),0);
      await page.getByLabel('Library type',{exact:true}).selectOption('source');
      assert.equal(await page.locator('.life-os-record-card').count(),1);
      await page.getByLabel('Library type',{exact:true}).selectOption('all');
      await page.getByLabel('Library status',{exact:true}).selectOption('completed');
      assert.equal(await page.locator('.life-os-record-card').count(),1);
      assert.ok((await page.locator('.life-os-record-card').innerText()).includes('Finished book'));
    }
    if(screen==='ai'){
      assert.ok((await page.locator('.life-os-connection-map').innerText()).includes('not tested here'));
    }
    if(screen==='plan'){
      assert.equal(await page.locator('.life-os-calendar-day').count(),42);
      await page.getByRole('button',{name:'2026-09-09: Open daily note',exact:true}).click();
      assert.equal(await page.evaluate(()=>window.opened.at(-1)?.path),'01 Journal/Daily/2026-09-09.md');
      await page.getByRole('button',{name:'Next month',exact:true}).click();
      assert.ok((await page.locator('.life-os-calendar h2').innerText()).includes('October'));
      await page.getByRole('button',{name:'This month',exact:true}).click();
    }
    if(screen==='review'){
      await page.getByRole('button',{name:'7 days',exact:true}).click();
      assert.equal(await page.locator('.life-os-effort-column').count(),7);
      await page.locator('.life-os-effort-column[role="button"]').first().press('Enter');
      assert.ok(await page.evaluate(()=>window.opened.at(-1)?.path.startsWith('01 Journal/Daily/')));
      await page.getByText('Read daily values',{exact:true}).click();
      assert.equal(await page.locator('.life-os-chart-table tbody tr').count(),7);
      await page.getByRole('button',{name:/Open scored retreat/}).click();
      assert.ok(await page.evaluate(()=>window.opened.at(-1)?.path.startsWith('02 Retreats/')));
    }
  }
  await page.evaluate(()=>{window.view.activeScreen='home';window.view.render();window.previousPreview=window.view.previewBrain;});
  await page.locator('.life-os-display-options summary').click();
  await page.getByRole('button',{name:'Hide optional visuals',exact:true}).click();
  assert.equal(await page.locator('.life-os-brain-preview').count(),0);
  assert.ok(await page.evaluate(()=>window.previousPreview.ctx===null));
  await page.locator('.life-os-display-options summary').click();
  await page.getByLabel('Items per list',{exact:true}).selectOption('3');
  assert.equal(await page.evaluate(()=>window.view.itemLimit),3);
  await page.locator('.life-os-display-options summary').click();
  await page.getByRole('button',{name:'Restore view defaults',exact:true}).click();
  assert.equal(await page.locator('.life-os-brain-preview canvas').count(),1);
  await page.getByRole('button',{name:/Explore Brain/}).click();
  assert.equal(await page.locator('.life-os-brain-embedded canvas').count(),1);
  await page.getByRole('button',{name:'Home',exact:true}).click();
  for(const width of [900,620,390]){
    await page.setViewportSize({width,height:900});
    for (const screen of ['home','today','plan','review','focus','projects','people','create','library','ai']) {
      await page.evaluate(s=>{window.view.activeScreen=s;window.view.render();},screen);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${screen} document overflow at ${width}`);
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.life-os-display-options summary').click();
  await page.getByRole('button',{name:'Use compact spacing',exact:true}).click();
  assert.equal(await page.locator('.life-os-app-frame.is-compact').count(),1);
  for(let pass=0;pass<3;pass++){
    await page.getByRole('button',{name:'Brain',exact:true}).click();
    assert.equal(await page.locator('.life-os-rail').count(),1);
    assert.equal(await page.locator('.life-os-brain-embedded canvas').count(),1);
    assert.equal(await page.locator('.life-os-nav-button[aria-current="page"]').innerText(),'Brain');
    await page.evaluate(()=>{window.previousBrain=window.view.embeddedBrain;window.view.render();});
    assert.ok(await page.evaluate(()=>window.previousBrain===window.view.embeddedBrain));
    const canvas=page.locator('.life-os-brain-embedded canvas');
    await canvas.press('ArrowRight');
    assert.ok(await page.evaluate(()=>window.view.embeddedBrain.yaw>0.28));
    if(pass===0)await page.screenshot({path:screenshotPath('life-os-brain-sidebar.png'),fullPage:true});
    await page.getByRole('button',{name:'Home',exact:true}).click();
    assert.equal(await page.locator('.life-os-brain-embedded').count(),0);
    assert.ok(await page.evaluate(()=>window.previousBrain.ctx===null && window.view.embeddedBrain===null));
  }
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>{window.view.activeScreen='home';window.view.render();});
  await page.locator('.life-os-display-options summary').click();
  await page.getByRole('button',{name:"Hide this module's visual",exact:true}).click();
  assert.equal(await page.locator('.life-os-brain-preview').count(),0);
  await page.evaluate(()=>{window.view.activeScreen='ai';window.view.render();});
  assert.equal(await page.locator('.life-os-ai-diagram').count(),1);
  await page.evaluate(()=>{
    const theme={'--background-primary':'#faf9f6','--background-secondary':'#f0eeea','--text-normal':'#24272b','--text-muted':'#535962','--text-faint':'#686d74','--background-modifier-border':'#cbc7c0'};
    for(const [key,value] of Object.entries(theme))document.documentElement.style.setProperty(key,value);
    window.view.activeScreen='home';window.view.visualOptions={};window.view.render();
  });
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:screenshotPath('life-os-home-light-candidate.png')});
  await page.evaluate(async()=>{
    const theme={'--background-primary':'#17191c','--background-secondary':'#202328','--text-normal':'#ddd','--text-muted':'#a5abb3','--text-faint':'#777','--background-modifier-border':'#393d44'};
    for(const [key,value] of Object.entries(theme))document.documentElement.style.setProperty(key,value);
    window.addLocalizedFixture();window.view.compactLayout=false;window.view.visualOptions={};
    await window.view.refreshLiveData();await window.plugin.setLanguage('zh-CN');
  });
  assert.equal(await page.evaluate(()=>window.savedLanguages.at(-1).language),'zh-CN');
  assert.equal(await page.getByRole('button',{name:'首页',exact:true}).count(),1);
  assert.equal(await page.getByRole('button',{name:'今天',exact:true}).count(),1);
  for(const screen of ['home','today','plan','review','focus','projects','people','create','library','ai']){
    await page.evaluate(s=>{window.view.activeScreen=s;window.view.render();},screen);
    assert.ok(await page.locator('.life-os-shell').innerText(),`Chinese ${screen} module renders`);
    const expected=await page.evaluate(s=>({label:window.plugin.t(window.uiMessages.navItems.find(item=>item.id===s).label),title:window.plugin.t(window.uiMessages.modules[s]?.title||'LIFE'),description:window.plugin.t(s==='home'?'See clearly. Choose deliberately. Live fully.':window.uiMessages.modules[s].description)}),screen);
    assert.equal(await page.locator('.life-os-nav-button[aria-current="page"]').innerText(),expected.label,`Chinese ${screen} selected navigation`);
    assert.match(expected.description,/[\u3400-\u9fff]/u,`Chinese ${screen} owns a translated description`);
    if(screen==='home')assert.equal(await page.locator('.life-os-identity p').innerText(),expected.description);
    else{
      assert.equal(await page.locator('.life-os-module-header h1').innerText(),expected.title,`Chinese ${screen} module title`);
      assert.equal(await page.locator('.life-os-module-header > p').innerText(),expected.description,`Chinese ${screen} module description`);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Chinese ${screen} desktop overflow`);
    await page.screenshot({path:screenshotPath(`life-os-${screen}-zh-CN.png`),fullPage:true});
    if(screen==='today'){
      assert.ok((await page.locator('.life-os-today-row').allTextContents()).some(text=>text.includes('Home')),'User question remains Home');
      assert.ok((await page.locator('.life-os-task-row').allTextContents()).some(text=>text.includes('Today')),'User task remains Today');
      assert.match(await page.locator('.life-os-checkin-meter').getAttribute('aria-label'),/[\u3400-\u9fff]/u);
    }
    if(screen==='projects'){
      const card=page.locator('.life-os-record-card').filter({has:page.getByText('Today',{exact:true})});
      assert.equal(await card.count(),1,'User note title remains Today');
      await card.click();assert.equal(await page.evaluate(()=>window.opened.at(-1).path),'04 Projects/Today.md');
    }
  }
  await page.getByRole('button',{name:await page.evaluate(()=>window.plugin.t('Brain')),exact:true}).click();
  const brainSearchLabel=await page.evaluate(()=>window.plugin.t('Search brain notes'));
  assert.match(brainSearchLabel,/[\u3400-\u9fff]/u);
  assert.equal(await page.getByRole('searchbox',{name:brainSearchLabel}).count(),1);
  assert.equal(await page.locator('.life-os-brain-note').filter({has:page.getByText('Today',{exact:true})}).count(),1);
  await page.screenshot({path:screenshotPath('life-os-brain-zh-CN.png'),fullPage:true});
  await page.getByRole('button',{name:'首页',exact:true}).click();
  await page.locator('.life-os-action').filter({has:page.getByText('日记',{exact:true})}).click();
  assert.equal(await page.evaluate(()=>window.commands.at(-1)),'quickadd:choice:lifeos-journal');
  await page.setViewportSize({width:390,height:900});
  for(const screen of ['home','today','plan','review','focus','projects','people','create','library','ai']){
    await page.evaluate(s=>{window.view.activeScreen=s;window.view.render();},screen);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Chinese ${screen} document overflow at 390`);
  }
  await page.evaluate(()=>{window.view.activeScreen='home';window.view.render();});
  await page.screenshot({path:screenshotPath('life-os-home-zh-CN-narrow.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('combobox',{name:await page.evaluate(()=>window.plugin.t('Life OS language'))}).selectOption('en');
  await page.getByRole('button',{name:'Home',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>window.savedLanguages.at(-1).language),'en');

  // Obsidian panes can be narrow inside a wide application window. Testing only
  // the viewport's width would exercise media queries and miss this regression.
  await page.evaluate(()=>{
    const root=document.querySelector('#root');
    root.style.width='390px';root.style.marginInlineStart='auto';
    document.querySelector('[role="note"]').style.right='0';
  });
  for(const locale of ['en','zh-CN']){
    const languageLabel=await page.evaluate(()=>window.plugin.t('Life OS language'));
    await page.getByRole('combobox',{name:languageLabel,exact:true}).selectOption(locale);
    assert.equal(await page.evaluate(()=>window.plugin.language),locale);
    for(const screen of ['home','today','plan','review','focus','projects','people','create','library','ai']){
      await page.evaluate(s=>{window.view.activeScreen=s;window.view.render();},screen);
      const layout=await page.evaluate(()=>{
        const root=document.querySelector('#root');root.scrollTop=0;root.scrollLeft=0;
        // Preserve native setIcon's SVG footprint in this otherwise iconless stub.
        for(const button of document.querySelectorAll('.life-os-topbar-button')){
          const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
          svg.setAttribute('width','24');svg.setAttribute('height','24');
          button.firstElementChild.replaceChildren(svg);
        }
        const bounds=root.getBoundingClientRect();
        const controls=[...document.querySelectorAll('.life-os-language-select,.life-os-topbar-button,.life-os-display-options > summary')];
        const nav=document.querySelector('.life-os-nav');
        return {
          viewport:innerWidth,width:bounds.width,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,
          documentOverflow:document.documentElement.scrollWidth>innerWidth,
          controls:controls.map(control=>{
            const rect=control.getBoundingClientRect();
            return {label:control.getAttribute('aria-label')||control.textContent.trim(),visible:rect.width>0&&rect.height>0&&rect.left>=bounds.left-1&&rect.right<=bounds.right+1&&rect.top>=bounds.top&&rect.bottom<=bounds.bottom};
          }),
          navScrolls:nav.scrollWidth>nav.clientWidth,
          navOverflow:getComputedStyle(nav).overflowX,
        };
      });
      assert.equal(layout.viewport,1440);
      assert.equal(layout.width,390);
      assert.equal(layout.documentOverflow,false,`${locale} ${screen} wide-window document overflow`);
      assert.ok(layout.scrollWidth<=layout.clientWidth+1,`${locale} ${screen} outer pane overflow: ${layout.scrollWidth}/${layout.clientWidth}`);
      assert.equal(layout.controls.length,5);
      assert.ok(layout.controls.every(control=>control.visible),`${locale} ${screen} clipped toolbar controls: ${JSON.stringify(layout.controls)}`);
      assert.ok(!layout.navScrolls||['auto','scroll'].includes(layout.navOverflow),`${locale} ${screen} navigation must scroll within its own container`);
    }
    const brainLabel=await page.evaluate(()=>window.plugin.t('Brain'));
    await page.getByRole('button',{name:brainLabel,exact:true}).click();
    const graph=await page.evaluate(()=>{
      const root=document.querySelector('#root');
      const body=document.querySelector('.life-os-brain-embedded .life-os-brain-body');
      const stage=body.querySelector('.life-os-brain-stage').getBoundingClientRect();
      const canvas=body.querySelector('canvas').getBoundingClientRect();
      const panel=body.querySelector('.life-os-brain-panel').getBoundingClientRect();
      return {paneWidth:root.clientWidth,scrollWidth:root.scrollWidth,direction:getComputedStyle(body).flexDirection,stageWidth:stage.width,stageHeight:stage.height,canvasWidth:canvas.width,canvasHeight:canvas.height,panelWidth:panel.width,stageBottom:stage.bottom,panelTop:panel.top};
    });
    assert.ok(graph.scrollWidth<=graph.paneWidth+1,`${locale} embedded Brain outer pane overflow`);
    assert.ok(graph.stageWidth>=300&&graph.canvasWidth>=300,`${locale} embedded Brain drawing area is squeezed: ${JSON.stringify(graph)}`);
    assert.ok(graph.stageHeight>=360&&graph.canvasHeight>=360,`${locale} embedded Brain drawing area is too short`);
    assert.equal(graph.direction,'column',`${locale} embedded Brain panel must stack below the canvas`);
    assert.ok(Math.abs(graph.panelWidth-graph.stageWidth)<=1&&Math.abs(graph.stageWidth-graph.paneWidth)<=1,`${locale} embedded Brain panel and canvas must use the pane width`);
    assert.ok(graph.panelTop>=graph.stageBottom-1,`${locale} embedded Brain panel must not occupy the canvas's side`);
    await page.locator('.life-os-brain-embedded canvas').press('ArrowRight');
    assert.ok(await page.evaluate(()=>window.view.embeddedBrain.yaw>0.28));
    await page.locator('#root').screenshot({path:screenshotPath(`life-os-brain-${locale}-390-pane-wide-window.png`)});
    const labels=await page.evaluate(()=>Object.fromEntries(['Search','Configure','Capture'].map(key=>[key,window.plugin.t(key)])));
    await page.getByRole('button',{name:labels.Search,exact:true}).click();
    assert.equal(await page.evaluate(()=>window.commands.at(-1)),'global-search:open');
    await page.getByRole('button',{name:labels.Configure,exact:true}).click();
    assert.equal(await page.evaluate(()=>window.opened.at(-1).path),'Meta/Compass Config.md');
    await page.getByRole('button',{name:labels.Capture,exact:true}).click();
    assert.equal(await page.evaluate(()=>window.commands.at(-1)),'capture');
    await page.locator('.life-os-display-options summary').click();
    assert.equal(await page.locator('.life-os-display-options').evaluate(element=>element.open),true);
    await page.locator('.life-os-display-options summary').click();
    await page.evaluate(()=>{window.view.activeScreen='home';window.view.render();});
    await page.locator('#root').screenshot({path:screenshotPath(`life-os-${locale}-390-pane-wide-window.png`)});
  }
  await page.evaluate(()=>{
    const root=document.querySelector('#root');root.style.width='';root.style.marginInlineStart='';
    document.querySelector('[role="note"]').style.right='';
  });
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>window.view.onClose());
  console.log('Dashboard browser checks passed: ten modules in English and Chinese, language persistence, preserved user titles and routing, localized Brain accessibility, Home spacing, preview/full Brain navigation, workload groups, project counts, discussion links, board previews, Library filters and remote-cover rejection, AI branches, per-module controls, narrow viewports and 390px panes in a wide window, visible and usable toolbar controls, full-width embedded Brain with details below its drawing area, and light-theme smoke check. Synthetic fixture only.');
}finally{await browser.close();}
