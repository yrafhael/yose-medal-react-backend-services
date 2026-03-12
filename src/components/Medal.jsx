import { Flex, Text, Button } from "@radix-ui/themes";
import AppTooltip from "./AppTooltip";

function Medal({ country, medal, onIncrement, onDecrement, canPatch }) {
  const medalName =
    medal.name.charAt(0).toUpperCase() + medal.name.slice(1);

  const medalCount = country[medal.name];

  return (
    <Flex justify="between" align="center">
      <Text>
        {medalName}: {medalCount}
      </Text>

      {canPatch && (
        <Flex gap="2">
          <AppTooltip content={`Increase ${medalName}`}>
            <Button onClick={() => onIncrement(country.id, medal.name)}>+</Button>
          </AppTooltip>

          <AppTooltip content={`Decrease ${medalName}`}>
            <span>
              <Button
                onClick={() => onDecrement(country.id, medal.name)}
                disabled={medalCount === 0}
              >
                -
              </Button>
            </span>
          </AppTooltip>
        </Flex>
      )}
    </Flex>
  );
}

export default Medal;