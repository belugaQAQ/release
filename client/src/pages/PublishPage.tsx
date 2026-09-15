import {M3eButton} from '@m3e/react/button';
import {M3eButtonSegment} from '@m3e/react/segmented-button';
import {M3eCard} from '@m3e/react/card';
import {M3eFormField} from '@m3e/react/form-field';
import {M3eHeading} from '@m3e/react/heading';
import {ReleaseForm} from '../utils/api';

type Props = { beta: boolean; form: ReleaseForm; loading: boolean; status: string; onBeta: (value: boolean) => void; onChange: (key: keyof ReleaseForm, value: string) => void; onSubmit: () => void };
export default function PublishPage({beta, form, loading, status, onBeta, onChange, onSubmit}: Props) {
    return <M3eCard variant="elevated"><div slot="content" className="admin-card"><div className="admin-section-title"><M3eHeading variant="title" size="large" level="2">发布管理</M3eHeading><m3e-segmented-button aria-label="编辑通道"><M3eButtonSegment checked={!beta} onClick={() => onBeta(false)}>稳定版</M3eButtonSegment><M3eButtonSegment checked={beta} onClick={() => onBeta(true)}>Beta</M3eButtonSegment></m3e-segmented-button></div>{loading ? <p>读取中…</p> : <div className="admin-form">{(['version','url','size','sha256'] as const).map(k => <M3eFormField key={k} variant="outlined"><label slot="label">{k === 'version' ? '版本号' : k === 'url' ? '下载链接' : k === 'size' ? '文件大小（字节）' : 'SHA-256'}</label><input value={form[k]} onChange={e => onChange(k, e.target.value)}/></M3eFormField>)}<M3eFormField variant="outlined"><label slot="label">变更日志</label><textarea value={form.changelog} onChange={e => onChange('changelog', e.target.value)}/></M3eFormField><M3eButton onClick={onSubmit} variant="filled">发布{beta ? ' Beta' : '稳定版'}</M3eButton></div>}<p className="status">{status}</p></div></M3eCard>;
}
