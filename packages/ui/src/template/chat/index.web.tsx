import { getApiHello, GetApiHello200 } from 'api';
import React, { useEffect, useState } from 'react';

import { SharedChatTemplate, SharedChatIndexTemplateProps } from './shared';

export function ChatIndexTemplate({ children }: SharedChatIndexTemplateProps) {
  const [response, setResponse] = useState<GetApiHello200>();

  useEffect(function fetchOnDidMount() {
    getApiHello().then(res => {
      setResponse(res);
    });
  }, []);

  return <SharedChatTemplate {...response}>{children}</SharedChatTemplate>;
}
