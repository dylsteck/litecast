import 'server-only';
import { getApiPost } from 'api';
import { HomeTemplate } from 'ui';

import ClientBoundary from './clientBoundary';

export default async function Home() {
  const data = await getApiPost();

  return (
    <>
      <ClientBoundary />
      <HomeTemplate data={data} />
    </>
  );
}
