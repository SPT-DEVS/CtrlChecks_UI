import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/useRole';
import { InputGuideLink } from './InputGuideLink';

interface GoogleSheetsSettingsProps {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function GoogleSheetsSettings({ config, onConfigChange }: GoogleSheetsSettingsProps) {
  const { isAdmin } = useRole();

  const updateConfig = (key: string, value: unknown) => {
    onConfigChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">

      {/* Operation */}
      <div className="space-y-2">
        <Label htmlFor="operation">Operation</Label>
        <Select
          value={(config.operation as string) || 'read'}
          onValueChange={(value) => updateConfig('operation', value)}
        >
          <SelectTrigger id="operation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="append">Append</SelectItem>
            <SelectItem value="update">Update</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex justify-end">
          <InputGuideLink
            fieldKey="operation"
            fieldLabel="Operation"
            fieldType="select"
            nodeType="google_sheets"
          />
        </div>
      </div>

      {/* Spreadsheet ID */}
      <div className="space-y-2">
        <Label htmlFor="spreadsheetId">
          Spreadsheet ID <span className="text-destructive">*</span>
        </Label>
        <Input
          id="spreadsheetId"
          value={(config.spreadsheetId as string) || ''}
          onChange={(e) => updateConfig('spreadsheetId', e.target.value)}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Get this from the Google Sheets URL: /d/SPREADSHEET_ID/edit
          </p>
          <InputGuideLink
            fieldKey="spreadsheetId"
            fieldLabel="Spreadsheet ID"
            fieldType="text"
            nodeType="google_sheets"
          />
        </div>
      </div>

      {/* Sheet Name */}
      <div className="space-y-2">
        <Label htmlFor="sheetName">Sheet Name (Tab)</Label>
        <Input
          id="sheetName"
          value={(config.sheetName as string) || ''}
          onChange={(e) => updateConfig('sheetName', e.target.value)}
          placeholder="Sheet1"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Leave empty to use the first sheet
          </p>
          <InputGuideLink
            fieldKey="sheetName"
            fieldLabel="Sheet Name (Tab)"
            fieldType="text"
            nodeType="google_sheets"
          />
        </div>
      </div>

      {/* Range */}
      <div className="space-y-2">
        <Label htmlFor="range">Range (e.g., A1:D100)</Label>
        <Input
          id="range"
          value={(config.range as string) || ''}
          onChange={(e) => updateConfig('range', e.target.value)}
          placeholder="A1:D100"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Leave empty to read all used cells. For write/update, specify the target range.
          </p>
          <InputGuideLink
            fieldKey="range"
            fieldLabel="Range"
            fieldType="text"
            nodeType="google_sheets"
          />
        </div>
      </div>

      {/* Output Format (for read operations) */}
      {(config.operation === 'read' || !config.operation) && (
        <>
          <div className="space-y-2">
            <Label htmlFor="outputFormat">Output Format</Label>
            <Select
              value={(config.outputFormat as string) || 'json'}
              onValueChange={(value) => updateConfig('outputFormat', value)}
            >
              <SelectTrigger id="outputFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON Array</SelectItem>
                <SelectItem value="keyvalue">Key-Value Pairs</SelectItem>
                <SelectItem value="text">Plain Text Table</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <InputGuideLink
                fieldKey="outputFormat"
                fieldLabel="Output Format"
                fieldType="select"
                nodeType="google_sheets"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="readDirection">Read Direction</Label>
            <Select
              value={(config.readDirection as string) || 'rows'}
              onValueChange={(value) => updateConfig('readDirection', value)}
            >
              <SelectTrigger id="readDirection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rows">Row-wise (default)</SelectItem>
                <SelectItem value="columns">Column-wise</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end">
              <InputGuideLink
                fieldKey="readDirection"
                fieldLabel="Read Direction"
                fieldType="select"
                nodeType="google_sheets"
              />
            </div>
          </div>
        </>
      )}

      {/* Data to Write (for write operations) */}
      {(config.operation === 'write' || config.operation === 'append' || config.operation === 'update') && (
        <div className="space-y-2">
          <Label htmlFor="data">
            Data to Write (JSON) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="data"
            value={typeof config.data === 'string' ? config.data : JSON.stringify(config.data || [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateConfig('data', parsed);
              } catch {
                updateConfig('data', e.target.value);
              }
            }}
            placeholder={
              config.operation === 'append'
                ? '[["New Value 1", "New Value 2"]]'
                : '[["Header1", "Header2"], ["Value1", "Value2"]]'
            }
            rows={6}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {config.operation === 'append'
                ? 'Enter values to append as new rows: [["val1", "val2"]]'
                : 'Enter headers and values to overwrite: [["Header", "Header"], ["val1", "val2"]]'}
            </p>
            <InputGuideLink
              fieldKey="data"
              fieldLabel="Data to Write (JSON)"
              fieldType="json"
              nodeType="google_sheets"
            />
          </div>
        </div>
      )}

      {/* Allow Write Access (Admin only) */}
      {isAdmin && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="allowWrite">Allow Write Access</Label>
            <Switch
              id="allowWrite"
              checked={(config.allowWrite as boolean) || false}
              onCheckedChange={(checked) => updateConfig('allowWrite', checked)}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              ⚠️ Admin only: Enable write/update operations for this node
            </p>
            <InputGuideLink
              fieldKey="allowWrite"
              fieldLabel="Allow Write Access"
              fieldType="boolean"
              nodeType="google_sheets"
            />
          </div>
        </div>
      )}
    </div>
  );
}

