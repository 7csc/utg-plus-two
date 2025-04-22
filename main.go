package main

import (
	"context"
	"embed"

	"utg-plus-two/backend/services"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	exportService := services.NewExportService()
	calculateService := services.NewCalculateService()

	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "UTG+2",
		Width:  1200,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			exportService.SetContext(ctx)
		},
		Bind: []interface{}{
			exportService,
			calculateService,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
