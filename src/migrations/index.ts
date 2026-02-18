import * as migration_20260218_214939 from './20260218_214939';
import * as migration_20260218_222700 from './20260218_222700';
import * as migration_20260218_223224 from './20260218_223224';
import * as migration_20260218_231743 from './20260218_231743';

export const migrations = [
  {
    up: migration_20260218_214939.up,
    down: migration_20260218_214939.down,
    name: '20260218_214939',
  },
  {
    up: migration_20260218_222700.up,
    down: migration_20260218_222700.down,
    name: '20260218_222700',
  },
  {
    up: migration_20260218_223224.up,
    down: migration_20260218_223224.down,
    name: '20260218_223224',
  },
  {
    up: migration_20260218_231743.up,
    down: migration_20260218_231743.down,
    name: '20260218_231743'
  },
];
