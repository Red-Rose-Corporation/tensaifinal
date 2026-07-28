<?php

namespace App\Filament\Resources;

use App\Filament\Forms\Components\PasteBox;
use App\Filament\Resources\PostResource\Pages;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class PostResource extends Resource
{
    protected static ?string $model                = Post::class;
    protected static ?string $navigationIcon       = 'heroicon-o-newspaper';
    protected static ?string $navigationLabel      = 'Posts / News';
    protected static ?string $navigationGroup      = 'Content';
    protected static ?int    $navigationSort       = 1;
    protected static ?string $recordTitleAttribute = 'title';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasRole(['super_admin', 'admin']);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Content')
                ->description('The post title, body, and media.')
                ->schema([
                    Forms\Components\Hidden::make('created_by')
                        ->default(fn () => auth()->id()),

                    Forms\Components\TextInput::make('title')
                        ->required()
                        ->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn ($state, callable $set) =>
                            $set('slug', Str::slug($state))
                        ),

                    Forms\Components\TextInput::make('slug')
                        ->required()
                        ->unique(ignoreRecord: true)
                        ->maxLength(255),

                    Forms\Components\Select::make('type')
                        ->options([
                            'video'   => '🎬 YouTube Video',
                            'article' => '📰 Article / Link',
                            'text'    => '✍️ Original Text',
                        ])
                        ->required()
                        ->live(),

                    Forms\Components\TextInput::make('video_url')
                        ->label('YouTube URL')
                        ->url()
                        ->placeholder('https://www.youtube.com/watch?v=...')
                        ->required(fn (Get $get) => $get('type') === 'video')
                        ->visible(fn (Get $get) => $get('type') === 'video'),

                    Forms\Components\Textarea::make('excerpt')
                        ->label('Preview Text')
                        ->helperText('Shown to guests. Keep it short and compelling.')
                        ->required()
                        ->rows(3)
                        ->maxLength(500),

                    Forms\Components\RichEditor::make('body')
                        ->label('Full Content')
                        ->toolbarButtons([
                            'bold', 'italic', 'underline', 'strike',
                            'bulletList', 'orderedList', 'link', 'blockquote', 'h2', 'h3',
                        ])
                        ->helperText('Tip: use the " (Quote) button to insert a highlighted info box — it renders as a green callout with an info icon on the site.')
                        ->nullable(),

                    Forms\Components\Section::make('Comparison Table (optional)')
                        ->description('Build a comparison table like "Staying home vs. Going abroad" — appears below the article body on the site.')
                        ->collapsed(fn (Get $get) => blank($get('comparison_table.headers')))
                        ->schema([
                            Forms\Components\TextInput::make('comparison_table.title')
                                ->label('Table Title')
                                ->placeholder('দেশে থাকা বনাম আন্তর্জাতিক ক্যারিয়ার: বাস্তব তুলনা')
                                ->maxLength(255),

                            Forms\Components\Repeater::make('comparison_table.headers')
                                ->label('Columns (first column is the row-label column, e.g. "বিষয়")')
                                ->simple(
                                    Forms\Components\TextInput::make('label')
                                        ->required()
                                        ->placeholder('e.g. জাপান (SSW Kaigo)')
                                )
                                ->addActionLabel('Add column')
                                ->reorderable()
                                ->minItems(2)
                                ->maxItems(5)
                                ->columnSpanFull(),

                            Forms\Components\Repeater::make('comparison_table.rows')
                                ->label('Rows')
                                ->schema([
                                    Forms\Components\TextInput::make('label')
                                        ->label('Row label')
                                        ->required()
                                        ->placeholder('e.g. মাসিক আয় (প্রায়)'),
                                    Forms\Components\Repeater::make('values')
                                        ->label('Values (one per column, in the same order as the columns above)')
                                        ->simple(
                                            Forms\Components\TextInput::make('value')
                                                ->required()
                                                ->placeholder('e.g. ১,২০,০০০–১,৭০,০০০ টাকা')
                                        )
                                        ->addActionLabel('Add value')
                                        ->reorderable()
                                        ->minItems(1)
                                        ->maxItems(4),
                                ])
                                ->addActionLabel('Add row')
                                ->reorderable()
                                ->columnSpanFull(),
                        ])
                        ->columns(1),

                    Forms\Components\Section::make('Box (optional)')
                        ->description('A simple highlighted box shown below the article body — for a quick note, list, or a table pasted from Word/Excel/Sheets. Leave empty to skip it entirely.')
                        ->collapsed(fn (Get $get) => blank($get('content_box.content')))
                        ->schema([
                            Forms\Components\TextInput::make('content_box.title')
                                ->label('Box Title (optional)')
                                ->maxLength(255),

                            PasteBox::make('content_box.content')
                                ->label('Box Content')
                                ->helperText('Type normally, or paste text/a table copied from Word, Excel, or Google Sheets — tables keep their rows and columns.')
                                ->nullable(),
                        ])
                        ->columns(1),

                    Forms\Components\Section::make('Feature Image')
                        ->schema([
                            Forms\Components\Placeholder::make('thumbnail_preview')
                                ->label('Current image')
                                ->content(function ($record) {
                                    if (!$record?->thumbnail_file) {
                                        return 'No image uploaded yet.';
                                    }
                                    $disk = app()->environment('production') ? 'r2' : 'public';
                                    $url  = Storage::disk($disk)->url($record->thumbnail_file);
                                    return new \Illuminate\Support\HtmlString(
                                        '<img src="' . e($url) . '" style="max-width:320px;border-radius:0.75rem;" />'
                                    );
                                })
                                ->visible(fn ($record) => filled($record?->thumbnail_file)),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('delete_thumbnail')
                                    ->label('Delete current image')
                                    ->icon('heroicon-o-trash')
                                    ->color('danger')
                                    ->requiresConfirmation()
                                    ->visible(fn ($record) => filled($record?->thumbnail_file))
                                    ->action(function ($record, $livewire) {
                                        $record->update(['thumbnail_file' => null]);
                                        $livewire->refreshFormData(['thumbnail_file']);
                                        Notification::make()->title('Image deleted')->success()->send();
                                    }),
                            ]),

                            Forms\Components\FileUpload::make('thumbnail_file')
                                ->label('Upload a new image (replaces the current one)')
                                ->image()
                                ->disk(app()->environment('production') ? 'r2' : 'public')
                                ->directory('post-thumbnails')
                                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                ->maxSize(4096)
                                ->nullable()
                                // The existing file is shown via the Placeholder above instead of being
                                // restored into this field - restoring it here hung forever waiting on
                                // R2 for file info on every page load. This field is write-only: it
                                // starts empty and only ever creates a *new* thumbnail.
                                ->afterStateHydrated(fn (Forms\Components\FileUpload $component) => $component->state(null))
                                ->dehydrated(fn ($state) => filled($state))
                                ->saveUploadedFileUsing(function ($file) {
                                    $disk = app()->environment('production') ? 'r2' : 'public';
                                    $image = (new ImageManager(new Driver()))
                                        ->read($file->getRealPath())
                                        ->cover(1200, 675);
                                    $path = 'post-thumbnails/' . Str::uuid() . '.jpg';
                                    Storage::disk($disk)->put($path, (string) $image->toJpeg(85));
                                    return $path;
                                })
                                ->helperText('Automatically cropped and resized to 1200 × 675 px (16:9). JPG / PNG / WebP — max 4 MB.'),

                            Forms\Components\TextInput::make('thumbnail_url')
                                ->label('— or paste an external URL')
                                ->url()
                                ->placeholder('https://images.unsplash.com/photo-...')
                                ->nullable()
                                ->helperText('Used only if no file is uploaded above.')
                                ->suffixAction(
                                    Forms\Components\Actions\Action::make('preview_url')
                                        ->icon('heroicon-o-eye')
                                        ->url(fn ($state) => $state)
                                        ->openUrlInNewTab()
                                        ->visible(fn ($state) => filled($state))
                                ),
                        ]),
                ]),

            Forms\Components\Section::make('Publishing')
                ->description('Categories, status, and publish date.')
                ->schema([
                    Forms\Components\CheckboxList::make('categories')
                        ->relationship('categories', 'name')
                        ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->flag} {$record->name}")
                        ->columns(3)
                        ->label('Tags'),

                    Forms\Components\Select::make('status')
                        ->options(['draft' => 'Draft', 'published' => 'Published'])
                        ->required()
                        ->default('draft'),

                    Forms\Components\Toggle::make('is_premium')
                        ->label('Premium content')
                        ->helperText('Guests must create a free account to view this.')
                        ->default(false),

                    Forms\Components\DateTimePicker::make('published_at')
                        ->label('Publish Date')
                        ->nullable(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->label('')
                    ->getStateUsing(fn ($record) => $record->thumbnail)
                    ->width(64)
                    ->height(42)
                    ->rounded(),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'video'   => 'info',
                        'article' => 'warning',
                        default   => 'primary',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'video'   => '🎬 Video',
                        'article' => '📰 Article',
                        default   => '✍️ Text',
                    }),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(45)
                    ->tooltip(fn ($record) => $record->title),

                Tables\Columns\TextColumn::make('categories.name')
                    ->badge()
                    ->separator(',')
                    ->limit(3)
                    ->color('gray'),

                Tables\Columns\IconColumn::make('is_premium')
                    ->label('Premium')
                    ->boolean()
                    ->trueIcon('heroicon-o-star')
                    ->falseIcon('heroicon-o-minus')
                    ->trueColor('warning')
                    ->falseColor('gray'),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state) => $state === 'published' ? 'success' : 'warning'),

                Tables\Columns\TextColumn::make('published_at')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->placeholder('—'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published']),
                Tables\Filters\SelectFilter::make('type')
                    ->options(['video' => '🎬 Video', 'article' => '📰 Article', 'text' => '✍️ Text']),
                Tables\Filters\TernaryFilter::make('is_premium')
                    ->label('Premium'),
            ])
            ->actions([
                Tables\Actions\Action::make('view_site')
                    ->label('Preview')
                    ->icon('heroicon-o-eye')
                    ->color('gray')
                    ->url(fn ($record) => rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/') . '/feed/' . $record->slug)
                    ->openUrlInNewTab(),

                Tables\Actions\EditAction::make(),

                Tables\Actions\Action::make('publish')
                    ->label('Publish')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'draft')
                    ->action(function ($record) {
                        $record->update([
                            'status'       => 'published',
                            'published_at' => $record->published_at ?? now(),
                        ]);
                        Notification::make()->title('Published!')->success()->send();
                    }),

                Tables\Actions\Action::make('unpublish')
                    ->label('Unpublish')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('warning')
                    ->visible(fn ($record) => $record->status === 'published')
                    ->requiresConfirmation()
                    ->modalHeading('Move back to Draft?')
                    ->modalDescription('This post will no longer be visible to users.')
                    ->action(function ($record) {
                        $record->update(['status' => 'draft']);
                        Notification::make()->title('Moved to draft')->warning()->send();
                    }),

                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit'   => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
