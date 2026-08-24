import { WasteOrganisationBackendAPI } from './wasteOrganisationBackendApi.js'
import { WasteMovementBackendAPI } from './wasteMovementBackendApi.js'
import { WasteMovementExternalAPI } from './wasteMovementApi.js'
import { CognitoOAuthApi } from './cognitoOAuth.js'
import { DefraIdStubAPI } from './defraIdStubApi.js'
import { GovPayAPI } from './govpayApi.js'
import { WasteOrganisationFrontendAPI } from './wasteOrganisationFrontendApi.js'
import { ZapApi } from './zap-api.js'

/**
 * @typedef {Object} ApiInstances
 * @property {WasteOrganisationBackendAPI} wasteOrganisationBackendAPI
 * @property {WasteMovementBackendAPI} wasteMovementBackendAPI
 * @property {WasteMovementExternalAPI} wasteMovementExternalAPI
 * @property {CognitoOAuthApi} cognitoOAuthApi
 * @property {DefraIdStubAPI} defraIdStubAPI
 * @property {GovPayAPI} govPayAPI
 * @property {WasteOrganisationFrontendAPI} wasteOrganisationFrontendAPI
 * @property {ZapApi} [zapAPI]
 */
export class ApiFactory {
  /**
   * @param {Object} testConfig - Parsed env config from test/support/<env>.config.json
   * @param {NodeJS.ProcessEnv} [env=process.env]
   * @returns {ApiInstances}
   */
  static create(testConfig, env = process.env) {
    const environment = env.ENVIRONMENT
    const httpProxy = env.ZAP_PROXY_API_URL ?? env.HTTP_PROXY

    const wasteOrganisationBackendServiceUrl = env.xapikey
      ? `https://ephemeral-protected.api.${environment}.cdp-int.defra.cloud/waste-organisation-backend`
      : testConfig.wasteOrganisationBackendServiceUrl

    const wasteMovementBackendServiceUrl = env.xapikey
      ? `https://ephemeral-protected.api.${environment}.cdp-int.defra.cloud/waste-movement-backend`
      : testConfig.wasteMovementBackendServiceUrl

    const apiInstances = {
      wasteMovementBackendAPI: new WasteMovementBackendAPI(
        wasteMovementBackendServiceUrl,
        httpProxy
      ),
      wasteOrganisationBackendAPI: new WasteOrganisationBackendAPI(
        wasteOrganisationBackendServiceUrl,
        httpProxy
      ),
      wasteMovementExternalAPI: new WasteMovementExternalAPI(
        testConfig.wasteMovementExternalApiBaseUrl,
        httpProxy
      ),
      cognitoOAuthApi: new CognitoOAuthApi(
        testConfig.cognitoOAuthBaseUrl,
        httpProxy
      ),
      defraIdStubAPI: new DefraIdStubAPI(
        testConfig.defraIdServiceUrl,
        httpProxy
      ),
      govPayAPI: new GovPayAPI(testConfig.govPayBaseUrl, httpProxy),
      wasteOrganisationFrontendAPI: new WasteOrganisationFrontendAPI(
        testConfig.wasteOrganisationFrontendBaseUrl,
        httpProxy
      )
    }

    if (env.ZAP_PROXY_URL) {
      apiInstances.zapAPI = new ZapApi(
        env.ZAP_PROXY_API_URL,
        null,
        env.ZAP_PROXY_API_KEY
      )
    }

    apiInstances.close = async () => {
      await Promise.all(
        Object.values(apiInstances)
          .filter((api) => api?.close)
          .map((api) => api.close())
      )
    }

    return apiInstances
  }
}
