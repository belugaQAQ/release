import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {M3eAppBar} from '@m3e/react/app-bar';
import {M3eButton} from '@m3e/react/button';
import {M3eButtonSegment} from '@m3e/react/segmented-button';
import {M3eCard} from '@m3e/react/card';
import {M3eDivider} from '@m3e/react/divider';
import {M3eFormField} from '@m3e/react/form-field';
import {M3eHeading} from '@m3e/react/heading';
import {M3eIcon} from '@m3e/react/icon';
import {M3eList, M3eListItem} from '@m3e/react/list';
import {Release} from '../utils/api';
import '@m3e/icons';

const empty: Release = {version:'0.0.0.0',url:'',size:0,changelog:'',sha256:'',releaseDate:''};
export default function PublicPage() {
 const [release,setRelease]=useState(empty),[beta,setBeta]=useState(false),[markdown,setMarkdown]=useState(''),[echo,setEcho]=useState(''),[user,setUser]=useState(''),[status,setStatus]=useState('');
 useEffect(()=>{Promise.all([fetch(`/api/${beta?'beta.json':'latest.json'}`).then(r=>r.json()),fetch(`/api/${beta?'betamd.md':'changelog.md'}`).then(r=>r.text())]).then(([r,m])=>{setRelease(r);setMarkdown(m)}).catch(()=>setStatus('暂时无法连接服务'))},[beta]);
 const submitEcho=async()=>{if(!echo.trim()||!user.trim())return setStatus('请填写留言和称呼');try{const r=await fetch('/api/echoes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:echo,user})});setStatus(r.ok?'留言已提交，等待审核':'提交失败');if(r.ok){setEcho('');setUser('')}}catch{setStatus('提交失败')}};
 return <><M3eAppBar size="small" for="page-scroll"><div slot="title" className="app-brand"><img className="app-logo" src="/favicon.svg" alt=""/><span>StickyHomeworks2 API</span></div><m3e-segmented-button slot="trailing" aria-label="发布通道"><M3eButtonSegment checked={!beta} onClick={()=>setBeta(false)}>稳定版</M3eButtonSegment><M3eButtonSegment checked={beta} onClick={()=>setBeta(true)}>Beta</M3eButtonSegment></m3e-segmented-button></M3eAppBar><div id="page-scroll" className="page-scroll"><main><section key={beta?'beta':'stable'} className="hero release-transition"><p className="eyebrow">{beta?'EARLY ACCESS':'LATEST RELEASE'}</p><M3eHeading variant="display" size="large">{release.version}</M3eHeading><p className="date">{release.releaseDate?new Date(release.releaseDate).toLocaleString():'尚无发布记录'}</p>{release.url&&<M3eButton href={release.url} target="_blank" variant="filled"><M3eIcon slot="icon" name="download"/>下载更新</M3eButton>}</section><section className="grid"><M3eCard className="release-card" variant="elevated"><div slot="content"><M3eHeading variant="title" size="large" level="2">版本说明</M3eHeading><ReactMarkdown>{markdown||release.changelog||'暂无更新日志'}</ReactMarkdown></div></M3eCard><M3eCard className="meta-card" variant="outlined"><div slot="content"><M3eHeading variant="title" size="large" level="2">校验信息</M3eHeading><M3eList><M3eListItem><span slot="overline">文件大小</span>{release.size?`${(release.size/1024/1024).toFixed(2)} MB`:'—'}</M3eListItem><M3eDivider/><M3eListItem><span slot="overline">SHA-256</span><span className="hash" slot="supporting-text">{release.sha256||'—'}</span></M3eListItem></M3eList></div></M3eCard></section><M3eCard className="echo" variant="filled"><div slot="content" className="echo-layout"><div><M3eHeading variant="headline" size="small" level="2">快来发个颠</M3eHeading><p>分享你的精神状态，审核通过后会展示在回声洞。</p></div><div className="form"><M3eFormField variant="outlined"><label slot="label" htmlFor="user">你的称呼</label><input id="user" value={user} onChange={e=>setUser(e.target.value)}/></M3eFormField><M3eFormField variant="outlined"><label slot="label" htmlFor="echo">想说点什么？</label><textarea id="echo" value={echo} onChange={e=>setEcho(e.target.value)}/></M3eFormField><M3eButton onClick={submitEcho} variant="tonal">发送留言</M3eButton></div></div></M3eCard><footer>{status||'服务状态正常'} <span>·</span> StickyHomeworks2 API</footer></main></div></>;
}
