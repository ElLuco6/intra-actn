import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WindowService {

    public location = window.location;
    public document = window.document;
    public history = window.history;
    public window = window;

    public get innerWidth(): number { return window.innerWidth; }
    public get length(): number { return window.length; }

    public get scrollY(): number { return window.scrollY; }
    public get pageYOffset(): number { return window.pageYOffset; }

    constructor() { }

    public scroll(x: number, y: number): void {
        window.scroll(x, y);
    }

    public scrollTo(x: number, y: number): void {
        window.scrollTo(x, y);
    }

    public setTimeout(handler: TimerHandler, timeout?: number): number {
        return window.setTimeout(handler, timeout);
    }

    public setInterval(handler: TimerHandler, timeout?: number): number {
        return window.setInterval(handler, timeout);
    }

    public clearTimeout(handle?: number): void {
        window.clearTimeout(handle);
    }

    public clearInterval(handle?: number): void {
        window.clearInterval(handle);
    }

    public dispatchEvent(event: Event): boolean {
        return window.dispatchEvent(event);
    }

    public open(url?: string, target?: string, features?: string): Window {
        return window.open(url, target, features);
    }

    public alert(message?: any): void {
        window.alert(message);
    }
}
