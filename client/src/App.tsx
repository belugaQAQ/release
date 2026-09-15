import {useState} from 'react';
import {M3eTheme} from '@m3e/react/theme';
import {M3eAppBar} from '@m3e/react/app-bar';
import AdminPage from './pages/AdminPage';
import PublicPage from './pages/PublicPage';
import './styles/global.css';

export default function App() {
    const [admin, setAdmin] = useState(false);
    return <M3eTheme scheme="auto" contrast="standard" density="0" motion="expressive">
        {admin ? <><M3eAppBar size="small">
            <div slot="title" className="app-brand"><img className="app-logo" src="/favicon.svg" alt=""/><span>StickyHomeworks2 API · 管理</span>
            </div>
        </M3eAppBar><AdminPage onExit={() => setAdmin(false)}/></> : <><PublicPage/>
            <button className="admin-entry" onClick={() => setAdmin(true)}>管理后台</button>
        </>}
    </M3eTheme>;
}
