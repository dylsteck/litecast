import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { openApp } from './openApp';

dayjs.locale('ko');

beforeEach(async () => {
  await openApp();
});
