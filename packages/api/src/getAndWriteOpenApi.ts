import { writeFileSync } from 'fs';
import { join } from 'path';

fetch(`http://localhost:3000/api/swagger`)
  .then(res => res.text())
  .then(res =>
    writeFileSync(join(process.cwd(), '/src/__generated__/openapi.json'), res, {
      encoding: 'utf8',
    }),
  )
  .catch(error => {
    console.error(error);
  });
