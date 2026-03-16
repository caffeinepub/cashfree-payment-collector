import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Payment {
    customerName: string;
    status: string;
    email: string;
    orderId: string;
    timestamp: bigint;
    phone: string;
    amount: bigint;
}
export interface CashfreeOrder {
    order_id: string;
    payment_session_id: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / * Public functions
     */
    createCashfreeOrder(customerName: string, email: string, phone: string, amount: bigint): Promise<CashfreeOrder>;
    getAllPayments(): Promise<Array<Payment>>;
    getCallerUserRole(): Promise<UserRole>;
    getFilteredPayments(filter: string): Promise<Array<Payment>>;
    getPaymentStatus(orderId: string): Promise<Payment | null>;
    getSortedPayments(): Promise<Array<Payment>>;
    handleCashfreeWebhook(requestBody: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / * Core functionality
     */
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
