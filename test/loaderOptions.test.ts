import { validateOptions } from "../src/loader";

describe("loader options validation", () => {
    test ("default options", () => {
        expect(validateOptions({}))
            .toEqual(
                expect.objectContaining({ mode: "run", export: false, stringify: false})
            );
    });

    test ("forced export", () => {
        expect(validateOptions({mode: "bind"}))
            .toEqual(
                expect.objectContaining({ mode: "bind", export: true, stringify: false})
            );
    });

    test("invalid forced export", () => {
        expect(
            validateOptions.bind(null, { mode: "bind", export: false})
        ).toThrowError();
        expect(
            validateOptions.bind(null, { mode: "bind", stringify: true})
        ).toThrowError();
    });

    test ("valid args", () => {
        expect(
            validateOptions({
                args: [1, "a", "", null, true, {a: "1"}]
            })
        ).toEqual(
            expect.objectContaining({
                args: [1, "a", "", null, true, {a: "1"}]
            })
        );

        expect(
            validateOptions({
                args: [[1, "a", "", null, true, {a: "1"}]]
            })
        ).toEqual(
            expect.objectContaining({
                args: [[1, "a", "", null, true, {a: "1"}]]
            })
        );

        expect(
            validateOptions({
                args: [{obj: [1, "a", "", null, true, {a: "1"}]}]
            })
        ).toEqual(
            expect.objectContaining({
                args: [{obj: [1, "a", "", null, true, {a: "1"}]}]
            })
        );
    });
});
