import 'server-only';
import { getApiNotifications } from 'api';

import ClientBoundary from './clientBoundary';

export default async function Page() {
  const data = await getApiNotifications();

  return <ClientBoundary data={data} />;
}
