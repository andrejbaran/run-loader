import { validateOptions } from "../src/loader";

describe("loader options validation", () => {
    test ("default options", () => {
        expect(validateOptions({}))
            .toEqual(
                expect.objectContaining({ export: false, stringify: false})
            );
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

    test("invalid args", () => {
        expect(
            validateOptions.bind(null, { args: {}})
        ).toThrowError();
        expect(
            validateOptions.bind(
                null,
                { args: [[[ {f: function() {}} ]]]}
            )
        ).toThrowError();
        expect(
            validateOptions.bind(
                null,
                { args: [{obj: {f: () => {}}}]}
            )
        ).toThrowError();
        expect(
            validateOptions.bind(null, { args: [undefined]})
        ).toThrowError();
    });
});
