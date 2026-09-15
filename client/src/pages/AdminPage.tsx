import {useEffect, useState} from 'react';
import {M3eIconButton} from '@m3e/react/icon-button';
import {M3eFab} from '@m3e/react/fab';
import {M3eNavRail, M3eNavRailToggle} from '@m3e/react/nav-rail';
import {M3eNavItem} from '@m3e/react/nav-bar';
import '@m3e/web/snackbar';
import {apiJson, downloadJson, Echo, ReleaseForm} from '../utils/api';
import AuthenticationPage from './AuthenticationPage';
import PublishPage from './PublishPage';
import EchoReviewPage from './EchoReviewPage';
import SecurityPage from './SecurityPage';

type Props = { onExit: () => void };
const emptyForm: ReleaseForm = {version: '', url: '', size: '', changelog: '', sha256: ''};
export default function AdminPage({onExit}: Props) {
    const [keyFile, setKeyFile] = useState<any>(null), [known, setKnown] = useState<boolean | null>(null), [form, setForm] = useState(emptyForm), [beta, setBeta] = useState(false), [status, setStatus] = useState(''), [echoes, setEchoes] = useState<Echo[]>([]), [loading, setLoading] = useState(false), [section, setSection] = useState<'publish' | 'echoes' | 'security'>('publish'), [approvedMode, setApprovedMode] = useState(false);
    useEffect(() => {
        fetch('/api/verify-key').then(r => r.json()).then(x => setKnown(x.hasExistingKey)).catch(() => setKnown(true));
    }, []);
    const auth = keyFile?.meta?.keyId;
    const headers = () => ({'Content-Type': 'application/json', Authorization: `Bearer ${auth}`});
    const notify = (message: string) => window.M3eSnackbar.open(message, true);
    const load = async () => {
        if (!auth) return;
        try {
            const [r, m] = await Promise.all([fetch(`/api/${beta ? 'beta.json' : 'latest.json'}`).then(r => r.json()), fetch(`/api/${beta ? 'betamd.md' : 'changelog.md'}`).then(r => r.text())]);
            setForm({version: r.version || '', url: r.url || '', size: r.size ? String(r.size) : '', changelog: m || r.changelog || '', sha256: r.sha256 || ''});
        } catch {
            setStatus('无法读取发布数据');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, [auth, beta]);
    const importKey = (file: File) => file.text().then(JSON.parse).then(async k => {
        await apiJson(await fetch('/api/verify-key', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({keyFile: k})}));
        setKeyFile(k);
        setStatus('');
        notify('认证成功');
    }).catch(e => { const message = e.message || '密钥文件无效'; setStatus(''); notify(message); });
    const generate = async () => {
        try {
            const b = await apiJson<any>(await fetch('/api/generate-key', {method: 'POST'}));
            setKeyFile(b.data);
            downloadJson(b.data, 'stickyhomeworks-key.json');
            setStatus('密钥生成成功');
        } catch (e) {
            setStatus((e as Error).message);
        }
    };
    const submit = async () => {
        if (!/^\d+\.\d+\.\d+\.\d+$/.test(form.version) || !/^https?:\/\//.test(form.url) || !/^\d+$/.test(form.size) || Number(form.size) <= 0 || !form.changelog.trim() || !/^[\da-f]{64}$/i.test(form.sha256)) return setStatus('请填写有效的版本、链接、大小、日志和 SHA-256');
        try {
            const b = await apiJson<any>(await fetch('/api/update', {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({data: {...form, size: Number(form.size)}, beta})
            }));
            setStatus(b.message || '发布成功');
            load();
        } catch (e) {
            setStatus((e as Error).message);
        }
    };
    const echoesLoad = async (approved = approvedMode) => {
        try {
            const b = await apiJson<any>(await fetch(`/api/echoes-admin?approved=${approved}`, {headers: headers()}));
            setEchoes(b.echoes || []);
        } catch (e) { setStatus((e as Error).message); }
    };
    const moderate = async (id: Echo['id'], action: 'approve' | 'reject' | 'delete') => {
        try {
            const deleting = action === 'delete';
            const b = await apiJson<any>(await fetch(deleting ? `/api/echoes-admin?id=${encodeURIComponent(String(id))}&action=delete` : '/api/echoes-admin', {method: 'POST', headers: headers(), body: JSON.stringify({id, action})}));
            setEchoes(x => x.filter(e => e.id !== id)); setStatus(b.message || '操作成功');
        } catch (e) { setStatus((e as Error).message); }
    };
    const reset = async () => {
        if (!confirm('确定重置密钥？')) return;
        try {
            const b = await apiJson<any>(await fetch('/api/reset-key', {method: 'POST', headers: headers()}));
            setKeyFile(b.data.newKeyFile);
            downloadJson(b.data.newKeyFile, 'stickyhomeworks-key-reset.json');
            setStatus('密钥重置成功');
        } catch (e) {
            setStatus((e as Error).message);
        }
    };
    if (!keyFile) return <AuthenticationPage known={known} status={status} onImport={importKey} onGenerate={generate}
                                             onExit={onExit}/>;
    const content = section === 'publish' ?
        <PublishPage beta={beta} form={form} loading={loading} status={status} onBeta={setBeta} onChange={(key, value) => setForm({...form, [key]: value})} onSubmit={submit}/> : section === 'echoes' ?
        <EchoReviewPage echoes={echoes} status={status} onLoad={echoesLoad} approved={approvedMode} onMode={setApprovedMode} onModerate={moderate}/> :
        <SecurityPage status={status} onReset={reset}/>;
    return <div className="admin-shell"><M3eNavRail id="admin-nav-rail" mode="auto" aria-label="管理导航"><M3eIconButton
        toggle><span className="material-symbols-outlined">menu</span><span className="material-symbols-outlined"
                                                                            slot="selected">menu_open</span><M3eNavRailToggle
        for="admin-nav-rail"/></M3eIconButton><M3eFab size="small" onClick={onExit}><span
        className="material-symbols-outlined">logout</span><span slot="label">退出管理</span></M3eFab><M3eNavItem
        selected={section === 'publish'} onClick={() => setSection('publish')}><span
        className="material-symbols-outlined" slot="icon">edit</span>发布管理</M3eNavItem><M3eNavItem
        selected={section === 'echoes'} onClick={() => { setSection('echoes'); echoesLoad(); }}><span className="material-symbols-outlined" slot="icon">feedback</span>回声管理</M3eNavItem><M3eNavItem
        selected={section === 'security'} onClick={() => setSection('security')}><span
        className="material-symbols-outlined" slot="icon">settings</span>安全设置</M3eNavItem></M3eNavRail>
        <div className="admin-content">{content}</div>
    </div>;
}
