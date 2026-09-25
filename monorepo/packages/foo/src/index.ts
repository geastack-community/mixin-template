import { Store } from '@geajs/core';
import { ComponentConstructor, Disposable, MixinConstructor } from '@geastack-community/utils';

/**
 * Define options that can be passed to the mixin under the name `GeaXxxOptions`.
 */
export interface GeaFooOptions {
    isHappy?: boolean;
    interestedIn?: 'compiler' | 'cli' | 'c++' | 'all'
}

export class GeaFoo extends Store {
    /**
     * This is a public property. This value can be accessed from outside the class.
     */
    isCuriousPerson = false;

    /**
     * Store the options as a property. In the constructor, assign the received options to this property.
     * Be sure to set default values at that time as well.
     */
    private options: Required<GeaFooOptions>;

    /**
     * 
     * @param options Options maintained by the mixin.
     * Inside a constructor, the following steps are performed:
     *  1. Calling `super()`
     *  2. Assigning values to the `options` property of the `options` object passed as an argument
     *  3. Assigning values to global properties
     *  4. Calling the custom `init` method to perform other initialization tasks.
     */
    constructor(options: GeaFooOptions = {}) {
        super();

        this.options = {
            isHappy: options.isHappy ?? true,
            interestedIn: options.interestedIn ?? 'all'
        };

        this.isCuriousPerson = this.options.interestedIn === 'all';

        this.init();
    }

    private init() {
        // Some kind of initialization process.
    }

    public destroy() {
        // At this point, please clean up all private properties and anything else that needs to be discarded.
        // Be sure to remove everything so that no trace remains.
    }
}

/**
 * Define the creator's name.
 * This prevents you from having to write the same name as a string in multiple places.
 */
const creator = 'createFoo';

/**
 * Define the `withXxx` interface, which is typically called by users.
 * Allow the creator's name to be changed, and finally, combine it with `Disposable` to add `dispose` to the type.
 */
export type WithFooMixin<K extends string = typeof creator> = {
    [P in K]: (
        options?: GeaFooOptions
    ) => GeaFoo;
} & Disposable;

/**
 * @internal
 * By defining it as a symbol, you can eliminate the risk of name conflicts when combining it with other mixins.
 */
export const managedFoos = Symbol("managedFoos");

/**
 * 
 * @param Base Pass the base class. For example, `Component`, `Store`, or `Object`. The class is selected based on the target to which the mixin is applied.
 * @param creatorName This is an optional argument. If there is a conflict in creator names when combining multiple mixins, you can pass a custom creator name to this argument to change the creator name and avoid the conflict.
 * These are Mixin functions that users typically call.
 */
export function withFoo<
    TBase extends ComponentConstructor,
    K extends string = typeof creator
>(
    Base: TBase,
    creatorName: K = creator as K
) {
    /**
     * `implements Disposable` ensures that the disposal functionality is implemented.
     */
    const Derived =  class extends Base implements Disposable {
        /**
         * @internal
         * Here, we’ve used an array type on the assumption that multiple instances of a single class will be used; however,
         * if you’re working with classes like `selectable`—which are designed to have only one instance created per class—set the type here to `GeaFoo | null` and set the initial value to `null`.
         * Also, in the `dispose` method, assign `null` to the variable to dispose of it.
         */
        [managedFoos]: GeaFoo[] = [];

        [creatorName](options?: GeaFooOptions): GeaFoo {
            const foo = new GeaFoo(options);
            this[managedFoos].push(foo);
            return foo;
        }

        dispose() {
            this[managedFoos].forEach(foo => foo.destroy());
            this[managedFoos] = [];

            super.dispose();
        }
    };

    return Derived as unknown as TBase & MixinConstructor<TBase, WithFooMixin<K>>;
}