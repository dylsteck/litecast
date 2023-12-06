import { getApiPostPostId } from 'api';
import React from 'react';
import { PostIdTemplate } from 'ui';

import ClientBoundary from './clientBoundary';

interface PageProps {
  params: Record<string, string>;
}

export default async function Page(props: PageProps) {
  const data = await getApiPostPostId(props.params?.postId);

  return (
    <>
      <ClientBoundary />
      <PostIdTemplate data={data} />
    </>
  );
}
