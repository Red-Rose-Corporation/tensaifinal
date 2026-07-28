@php
    $statePath = $getStatePath();
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <x-filament::input.wrapper :valid="! $errors->has($statePath)">
        <div
            x-data="{
                state: $wire.{{ $applyStateBindingModifiers("\$entangle('{$statePath}')") }},
                init() {
                    this.$refs.editable.innerHTML = this.state ?? ''
                    this.$refs.editable.addEventListener('focus', () => {
                        document.execCommand('defaultParagraphSeparator', false, 'p')
                    })
                    this.$watch('state', () => {
                        if (document.activeElement === this.$refs.editable) return
                        this.$refs.editable.innerHTML = this.state ?? ''
                    })
                },
            }"
            x-on:input="state = $refs.editable.innerHTML"
        >
            <div
                x-ref="editable"
                contenteditable="true"
                class="fi-paste-box prose prose-sm max-w-none min-h-[8rem] px-3 py-2.5 focus:outline-none dark:prose-invert [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-200 [&_td]:p-1.5 [&_th]:border [&_th]:border-gray-200 [&_th]:p-1.5"
            ></div>
        </div>
    </x-filament::input.wrapper>
</x-dynamic-component>
