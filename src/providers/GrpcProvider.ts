import { ChannelCredentials, ClientOptions, credentials } from '@grpc/grpc-js';
import { Network } from '../types/Network';
import { IProvider } from "./IProvider";

/**
 * Returns root CA credentails if secure.
 * @returns ChannelCredentials to connect to gRPC
 */
function generateCredentials(isSecure?: boolean): ChannelCredentials {
    return (isSecure || false) ? credentials.createSsl() : credentials.createInsecure();
}

export class GrpcProvider implements IProvider {

    constructor(network: Network, isSecure?: boolean, options?: Partial<ClientOptions>) {
        this.network = network;
        this.isSecure = isSecure || false;
        this.credentials = generateCredentials(this.isSecure);
        this.options = options;
    }    

    readonly network: Network;
    readonly isSecure: boolean;
    readonly credentials: ChannelCredentials;
    readonly options?: Partial<ClientOptions>;
}
