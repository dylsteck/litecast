import { getApiHello, GetApiHello200 } from 'api';
import React, { useCallback, useState } from 'react';

import { useRefetchOnFocus } from '../../hook/useRefetchOnFocus';

import { SharedChatTemplate, SharedChatIndexTemplateProps } from './shared';

export function ChatIndexTemplate({ children }: SharedChatIndexTemplateProps) {
  const [response, setResponse] = useState<GetApiHello200>();

  useRefetchOnFocus(
    useCallback(function fetchHelloApi() {
      getApiHello().then(res => {
        setResponse(res);
      });
    }, []),
    true,
  );

  return <SharedChatTemplate {...response}>{children}</SharedChatTemplate>;
}
