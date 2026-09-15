import {M3eButton} from '@m3e/react/button';
import {M3eCard} from '@m3e/react/card';
import {M3eHeading} from '@m3e/react/heading';
import {M3eList, M3eListItem} from '@m3e/react/list';
import {Echo} from '../utils/api';

type Props = { echoes: Echo[]; status: string; onLoad: (approved?: boolean) => void; approved: boolean; onMode: (approved: boolean) => void; onModerate: (id: Echo['id'], action: 'approve' | 'reject' | 'delete') => void };
export default function EchoReviewPage({echoes, status, onLoad, approved, onMode, onModerate}: Props) {
    return <M3eCard variant="outlined"><div slot="content" className="admin-card"><div className="admin-section-title"><M3eHeading variant="title" size="large" level="2">{approved ? '已通过回声洞管理' : '回声审核'}</M3eHeading><M3eButton onClick={() => { const next = !approved; onMode(next); setTimeout(() => onLoad(next), 0); }} variant="text">{approved ? '返回待审核' : '管理已通过'}</M3eButton><M3eButton onClick={() => onLoad(approved)} variant="tonal">刷新</M3eButton></div>{echoes.length === 0 ? <p>{approved ? '暂无已通过留言' : '暂无待审核留言'}</p> : <M3eList>{echoes.map(e => <M3eListItem key={e.id}><span slot="overline">{e.user}</span><span slot="supporting-text">{e.created_at || ''}</span><span>{e.text}</span><span slot="trailing">{approved ? <M3eButton onClick={() => onModerate(e.id, 'delete')} variant="text">删除</M3eButton> : <><M3eButton onClick={() => onModerate(e.id, 'approve')} variant="tonal">同意</M3eButton><M3eButton onClick={() => onModerate(e.id, 'reject')} variant="text">拒绝</M3eButton></>}</span></M3eListItem>)}</M3eList>}<p className="status">{status}</p></div></M3eCard>;
}
