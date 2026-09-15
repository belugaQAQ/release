import {M3eButton} from '@m3e/react/button';
import {M3eCard} from '@m3e/react/card';
import {M3eHeading} from '@m3e/react/heading';

type Props = { status: string; onReset: () => void };
export default function SecurityPage({status, onReset}: Props) {
    return <M3eCard variant="outlined"><div slot="content" className="admin-card"><M3eHeading variant="title" size="large" level="2">安全设置</M3eHeading><M3eButton onClick={onReset} variant="tonal">重置密钥</M3eButton><p className="status">{status}</p></div></M3eCard>;
}
