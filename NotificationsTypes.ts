export interface KeysProps{
    auth : string;
    p256dh : string;
}

export interface PushSubscriptionProps{
    endpoint : string;
    keys : KeysProps;
}