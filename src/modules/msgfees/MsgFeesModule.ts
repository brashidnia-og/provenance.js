import * as grpc from 'grpc';

import { 
    ITxClient,
    GasEstimate, 
} from '../../client';
import { IProvider } from '../../providers/IProvider';

import { IQueryClient, QueryClient } from '../../proto/provenance/msgfees/v1/query_grpc_pb';
import { CalculateTxFeesRequest } from '../../proto/provenance/msgfees/v1/query_pb';

const DEFAULT_FEE_ADJUSTMENT = 1.25;

export class MsgFeesModule {

    constructor(provider: IProvider, txClient: ITxClient) {
        this.provider = provider;
        this.txClient = txClient;
        this.queryClient = new QueryClient(this.provider.network.uri.toString(), grpc.credentials.createInsecure());
    }

    //----------------------------------------------------------------------------------------------------------------------------------------------
    // Query
    //----------------------------------------------------------------------------------------------------------------------------------------------

    // Reverse lookup of all names bound to a given address
    calculateTxFees(txBytes: Uint8Array, adjustment?: number): Promise<GasEstimate> {
        return new Promise<GasEstimate> ((resolve, reject) => {
            let feeAdjustment = adjustment || DEFAULT_FEE_ADJUSTMENT;
            let req = new CalculateTxFeesRequest()
                .setTxBytes(txBytes)
                .setGasAdjustment(feeAdjustment);

            console.log("calculateTxFees.req")
            console.log(JSON.stringify(req.toObject()));

            // TODO: Move GRPC unary call to the provider
            this.queryClient.calculateTxFees(req, (err, res) => {
                if (err != null) {
                    reject(err);
                } else {
                    console.log("calculateTxFees.res")
                    console.log(JSON.stringify(res.toObject()));
                    resolve(
                        new GasEstimate(
                            res.getEstimatedGas(),
                            res.getAdditionalFeesList(),
                            res.getTotalFeesList(),
                            feeAdjustment,
                        )
                    );
                }
            });
        });
    }

    protected readonly provider: IProvider;
    protected readonly txClient: ITxClient;
    protected readonly queryClient: IQueryClient;

};
