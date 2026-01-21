import type {
  dataProcessXtwitterService_ProcessMediaInMediaList,
  dataProcessXtwitterService_ProcessUrlsInUrlsList,
  dataProcessXtwitterService_ProcessUserInCoreUser
} from './services'

export type XtwitterMediaList = ReturnType<
  typeof dataProcessXtwitterService_ProcessMediaInMediaList
>

export type XtwitterUrlList = ReturnType<
  typeof dataProcessXtwitterService_ProcessUrlsInUrlsList
>

export type XtwitterCoreUser = ReturnType<
  typeof dataProcessXtwitterService_ProcessUserInCoreUser
>
