import {useRef} from 'react';
import {M3eButton} from '@m3e/react/button';
import {M3eCard} from '@m3e/react/card';
import {M3eHeading} from '@m3e/react/heading';



type Props = { known: boolean | null; status: string; onImport: (file: File) => void; onGenerate: () => void; onExit: () => void };

export default function AuthenticationPage({known, status, onImport, onGenerate, onExit}: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    return <main className="auth-page">
        <section className="auth-hero" aria-labelledby="auth-title">
            <span className="material-symbols-outlined auth-icon" aria-hidden="true">admin_panel_settings</span>
            <M3eHeading id="auth-title" variant="display" size="large">管理员认证</M3eHeading>
            <p>导入管理员密钥文件以访问版本发布、回声审核和安全设置。</p>
        </section>
        <M3eCard className="auth-card" variant="elevated"><div slot="content" className="auth-card-content">
            <M3eHeading variant="title" size="large" level="2">验证身份</M3eHeading>
            {known === false ? <div className="auth-action"><p>系统尚未配置管理员密钥。</p><M3eButton onClick={onGenerate} variant="filled"><span className="material-symbols-outlined" aria-hidden="true">key</span>生成新密钥</M3eButton></div> : <div className="auth-action">
                <input ref={fileInput} className="auth-file-input" id="admin-key-file" type="file" accept=".json,application/json" onChange={e => e.target.files?.[0] && onImport(e.target.files[0])}/>
                <M3eCard className="auth-drop-card" variant="outlined" role="button" tabIndex={0} onClick={() => fileInput.current?.click()} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()} onDragOver={e => {e.preventDefault(); e.currentTarget.classList.add('drag-over')}} onDragLeave={e => e.currentTarget.classList.remove('drag-over')} onDrop={e => {e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const file = e.dataTransfer.files[0]; if (file) onImport(file)}}>
                    <div slot="content" className="auth-drop-content"><span className="material-symbols-outlined auth-drop-icon" aria-hidden="true">upload_file</span><M3eHeading variant="title" size="medium" level="3">选择或拖放密钥文件</M3eHeading><p>支持 JSON 格式，点击此卡片选择文件</p></div>
                </M3eCard>
            </div>}
        </div></M3eCard>
        <M3eButton onClick={onExit} variant="text"><span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>返回公开页面</M3eButton>
    </main>;
}
