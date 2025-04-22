package services

import (
	"context"
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ExportService struct {
	ctx context.Context
}

func NewExportService() *ExportService {
	return &ExportService{}
}

func (e *ExportService) SetContext(ctx context.Context) {
	e.ctx = ctx
}

func (e *ExportService) ExportCounts(values map[string]int) (string, error) {

	currentDate := time.Now().Format("2006-01-02")
	defaultFilename := fmt.Sprintf("spr_%s.csv", currentDate)

	options := runtime.SaveDialogOptions{
		Title:           "Please select a location to save the file",
		DefaultFilename: defaultFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "CSV File",
				Pattern:     "*.csv",
			},
		},
	}

	fmt.Println("Calling SaveFileDialog...")
	path, err := runtime.SaveFileDialog(e.ctx, options)
	if err != nil {
		return "", fmt.Errorf("saveFileDialog error: %w", err)
	}

	if path == "" {
		return "", fmt.Errorf("destination was not selected")
	}

	file, err := os.Create(path)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}

	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	header := []string{"Label", "Odds text", "Break-even", "Attempts", "Succeed"}
	if err := writer.Write(header); err != nil {
		return "", err
	}

	bluffRows := []struct {
		Label      string
		OddsText   string
		BreakEven  string
		AttemptKey string
		SucceedKey string
	}{
		{"1/4", "$100:$25 = 4:1", "20%", "1-1", "1-2"},
		{"1/3", "$100:$33 = 3:1", "25%", "2-1", "2-2"},
		{"1/2", "$100:$50 = 2:1", "33%", "3-1", "3-2"},
		{"3/4", "$100:$75 = 1.3:1", "43%", "4-1", "4-2"},
		{"Pot Size", "$100:$100 = 1:1", "50%", "5-1", "5-2"},
	}

	if err := writer.Write([]string{"Bluff"}); err != nil {
		return "", err
	}

	for _, row := range bluffRows {
		record := []string{
			row.Label,
			row.OddsText,
			row.BreakEven,
			strconv.Itoa(values[row.AttemptKey]),
			strconv.Itoa(values[row.SucceedKey]),
		}
		if err := writer.Write(record); err != nil {
			return "", err
		}
	}

	if err := writer.Write([]string{"Hero Call"}); err != nil {
		return "", err
	}

	heroCallRows := []struct {
		Label      string
		OddsText   string
		BreakEven  string
		AttemptKey string
		SucceedKey string
	}{
		{"1/4", "5:1", "16.7%", "6-1", "6-2"},
		{"1/3", "4:1", "19.9%", "7-1", "7-2"},
		{"1/2", "3:1", "25%", "8-1", "8-2"},
		{"2/3", "2.5:1", "28.5%", "9-1", "9-2"},
		{"3/4", "2.3:1", "30%", "10-1", "10-2"},
		{"Pot Size", "2:1", "33.3%", "11-1", "11-2"},
	}

	for _, row := range heroCallRows {
		record := []string{
			row.Label,
			row.OddsText,
			row.BreakEven,
			strconv.Itoa(values[row.AttemptKey]),
			strconv.Itoa(values[row.SucceedKey]),
		}
		if err := writer.Write(record); err != nil {
			return "", err
		}
	}

	return path, nil
}
