import { registerAs } from '@nestjs/config';
type INodeEnv = 'development' | 'staging' | 'production';
type IEnvConfig = {
  NODE_ENV: INodeEnv;
  BASE_ENDPOINT: string;

  JWT_SECRET: string;
};

type PrefixedKeys<T, Prefix extends string> = {
  [K in keyof T & string as `${Prefix}${K}`]: T[K];
};

export type EnvConfigProps = PrefixedKeys<IEnvConfig, 'envConfig.'>;

const envConfigObject = registerAs<IEnvConfig>('envConfig', (): IEnvConfig => {
  return {
    NODE_ENV: process.env.NODE_ENV as INodeEnv,
    BASE_ENDPOINT: process.env.BASE_ENDPOINT,

    JWT_SECRET: process.env.JWT_SECRET,
  };
});
// console.log('🚀 ENV CONFIGURATION', envConfigObject());

export { envConfigObject };
