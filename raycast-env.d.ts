/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Project ID - The project_id value seen in the web request. */
  "projectId": string,
  /** User ID - The user_id value seen in the web request. */
  "userId": string,
  /** User Name - The user_name value seen in the web request. */
  "userName": string,
  /** Fone Cookie - The cookie value seen in the web request. */
  "cookie": string,
  /** TickTick Project ID - The tick tick project_id value seen in the web request. */
  "tickProjectId": string,
  /** TickTick Cookie - The cookie value seen in the web request. */
  "tickCookie": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `create` command */
  export type Create = ExtensionPreferences & {}
  /** Preferences accessible in the `index` command */
  export type Index = ExtensionPreferences & {}
  /** Preferences accessible in the `syncevent` command */
  export type Syncevent = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `create` command */
  export type Create = {}
  /** Arguments passed to the `index` command */
  export type Index = {}
  /** Arguments passed to the `syncevent` command */
  export type Syncevent = {}
}
