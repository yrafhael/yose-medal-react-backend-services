import { useState, useRef, useEffect } from "react";
import Country from "./components/Country";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";

const API_URL =
  "https://yose-medals-api-daf3faa2ekecbehf.centralus-01.azurewebsites.net/api/country";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [countries, setCountries] = useState([]);
  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);

  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to load countries");
        }

        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    }

    loadCountries();
  }, []);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }

  async function handleAdd(name) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          gold: 0,
          silver: 0,
          bronze: 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add country");
      }

      const newCountry = await response.json();
      setCountries((prevCountries) => [...prevCountries, newCountry]);
    } catch (error) {
      console.error("Error adding country:", error);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete country");
      }

      setCountries((prevCountries) =>
        prevCountries.filter((country) => country.id !== id)
      );
    } catch (error) {
      console.error("Error deleting country:", error);
    }
  }

  function handleIncrement(countryId, medalName) {
    setCountries((prevCountries) =>
      prevCountries.map((country) =>
        country.id === countryId
          ? { ...country, [medalName]: country[medalName] + 1 }
          : country
      )
    );
  }

  function handleDecrement(countryId, medalName) {
    setCountries((prevCountries) =>
      prevCountries.map((country) =>
        country.id === countryId
          ? { ...country, [medalName]: country[medalName] - 1 }
          : country
      )
    );
  }

  function getAllMedalsTotal() {
    let sum = 0;
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + b[medal.name], 0);
    });
    return sum;
  }

  return (
    <Theme appearance={appearance}>
      <Button
        onClick={toggleAppearance}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
        variant="ghost"
      >
        {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
      </Button>

      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        <NewCountry onAdd={handleAdd} />
      </Flex>

      <Container className="bg"></Container>

      <Grid pt="2" gap="2" className="grid-container">
        {[...countries]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((country) => (
            <Country
              key={country.id}
              country={country}
              medals={medals.current}
              onDelete={handleDelete}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>
    </Theme>
  );
}

export default App;