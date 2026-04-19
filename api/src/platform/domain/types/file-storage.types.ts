import { ConfigurableModuleBuilder } from '@nestjs/common';
import { StorageAdapter } from '@flystorage/file-storage';

export interface FileStorageModuleOptions {
  adapters: {
    [key: string]: StorageAdapter;
  };
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<FileStorageModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();
