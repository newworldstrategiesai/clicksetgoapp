import * as Select from '@radix-ui/react-select';

interface NewCampaignProps {
  userId: string; // Define the properties you expect
}

export function NewCampaign({ userId }: NewCampaignProps) {
  // your component logic here

  return (
    <Select.Root>
      <Select.Trigger className="SelectTrigger">
        <Select.Value placeholder="Select a value" />
      </Select.Trigger>
      <Select.Content>
        <Select.Viewport>
          <Select.Group>
            <Select.Item value="value1">
              <Select.ItemText>Option 1</Select.ItemText>
            </Select.Item>
            <Select.Item value="value2">
              <Select.ItemText>Option 2</Select.ItemText>
            </Select.Item>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}
