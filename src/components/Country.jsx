import { Card, Flex, Heading, Text, Button } from "@radix-ui/themes";
import Medal from "./Medal";
import AppTooltip from "./AppTooltip";

function Country({
  country,
  medals,
  onDelete,
  onIncrement,
  onDecrement,
  canDelete,
  canPatch,
}) {
  const totalMedals = country.gold + country.silver + country.bronze;

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">{country.name}</Heading>

          {canDelete && (
            <AppTooltip content="Delete this country">
              <Button onClick={() => onDelete(country.id)}>Delete</Button>
            </AppTooltip>
          )}
        </Flex>

        {medals.map((medal) => (
          <Medal
            key={medal.id}
            country={country}
            medal={medal}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            canPatch={canPatch}
          />
        ))}

        <Text weight="bold">Total Medals: {totalMedals}</Text>
      </Flex>
    </Card>
  );
}

export default Country;