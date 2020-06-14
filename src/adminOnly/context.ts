import { TelegrafContext } from 'telegraf/typings/context';

export interface AdminOnlyContext extends TelegrafContext {
  adminUserIds: string[],
}

export default AdminOnlyContext;
