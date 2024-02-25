import { ExpirationCompleteEvent, Publisher, Subjects} from "@enia0x63/common";


export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject =  Subjects.ExpirationComplete;

}