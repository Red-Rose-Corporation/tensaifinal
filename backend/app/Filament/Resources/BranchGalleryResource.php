<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BranchGalleryResource\Pages;
use App\Models\Branch;
use App\Models\GalleryItem;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Manages the same unified GalleryItem table as the main site's Gallery resource,
 * scoped to rows that have a branch_id — i.e. "branch gallery photos". A photo
 * created here (or via a branch admin's own dashboard) shows up both on that
 * branch's public page and in the main /gallery grid, tagged with its branch.
 */
class BranchGalleryResource extends Resource
{
    protected static ?string $model = GalleryItem::class;
    protected static ?string $navigationIcon  = 'heroicon-o-photo';
    protected static ?string $navigationGroup = 'Branches';
    protected static ?string $navigationLabel = 'Branch Gallery';
    protected static ?int    $navigationSort  = 4;
    protected static bool $shouldRegisterNavigation = false;

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->whereNotNull('branch_id');
        $user  = auth()->user();
        if ($user?->hasRole(['branch_admin', 'branch_manager']) && $user->branch_id) {
            $query->where('branch_id', $user->branch_id);
        }
        return $query;
    }

    public static function form(Form $form): Form
    {
        $user = auth()->user();
        return $form->schema([

            Forms\Components\Section::make('Basic Info')
                ->description('The title (optional) is what visitors see below this photo in the gallery grid.')
                ->icon('heroicon-o-identification')
                ->schema([
                    Forms\Components\Select::make('branch_id')
                        ->label('Branch')
                        ->options(fn () => $user?->hasRole(['branch_admin', 'branch_manager'])
                            ? Branch::where('id', $user->branch_id)->pluck('name', 'id')
                            : Branch::pluck('name', 'id'))
                        ->required()
                        ->default(fn () => $user?->branch_id)
                        ->columnSpanFull(),

                    Forms\Components\TextInput::make('title')->maxLength(255)->columnSpanFull(),
                    Forms\Components\Textarea::make('description')->rows(2)->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Image')
                ->description('Upload a photo from your computer, OR paste an external URL below. Upload takes priority.')
                ->icon('heroicon-o-photo')
                ->schema([
                    Forms\Components\FileUpload::make('image_path')
                        ->label('Image')
                        ->image()
                        ->disk(app()->environment('production') ? 'r2' : 'public')
                        ->directory('gallery')
                        ->visibility('public')
                        ->maxSize(8192)
                        ->helperText('JPG, PNG, WebP — max 8 MB. If the preview below sits on "Loading" for a while, that\'s just the browser fetching the thumbnail — the image itself has already uploaded fine.')
                        ->columnSpanFull(),

                    Forms\Components\TextInput::make('image_url')
                        ->label('Or paste image URL')
                        ->url()
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Visibility & Order')
                ->description('Control whether this photo is public, and where it appears relative to others.')
                ->icon('heroicon-o-eye')
                ->schema([
                    Forms\Components\Toggle::make('is_active')
                        ->label('Active (visible to public)')
                        ->default(true),

                    Forms\Components\TextInput::make('sort_order')
                        ->label('Sort Order')
                        ->numeric()
                        ->default(0)
                        ->helperText('Lower number appears first'),
                ])->columns(2),

        ]);
    }

    public static function table(Table $table): Table
    {
        $user = auth()->user();
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('branch.name')
                    ->label('Branch')
                    ->sortable()
                    ->hidden(fn () => $user?->hasRole(['branch_admin', 'branch_manager'])),

                Tables\Columns\TextColumn::make('title')->placeholder('—')->limit(40),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('sort_order')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('sort_order')
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index'  => Pages\ListBranchGalleries::route('/'),
            'create' => Pages\CreateBranchGallery::route('/create'),
            'edit'   => Pages\EditBranchGallery::route('/{record}/edit'),
        ];
    }
}
