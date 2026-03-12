import { useState, useRef, useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
  Text,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";

import Country from "./components/Country";
import NewCountry from "./components/NewCountry";
import LoginDialog from "./components/LoginDialog";
import AppTooltip from "./components/AppTooltip";
import {
  parseJwt,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getRolesFromToken,
  hasRole,
} from "./utils/auth";

const API_URL =
  "https://yose-medals-api-daf3faa2ekecbehf.centralus-01.azurewebsites.net/api/country";
const AUTH_URL =
  "https://yose-medals-api-daf3faa2ekecbehf.centralus-01.azurewebsites.net/api/auth/login";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [countries, setCountries] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [token, setToken] = useState(getStoredToken());
  const [roles, setRoles] = useState([]);
  const [username, setUsername] = useState("");

  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);

  function showToast(message) {
    setToastOpen(false);
    setToastMessage(message);
    setTimeout(() => setToastOpen(true), 10);
  }

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      setRoles(getRolesFromToken(token));
      setUsername(payload?.username || payload?.sub || "");
    } else {
      setRoles([]);
      setUsername("");
    }
  }, [token]);

  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load countries");
        }

        const data = await response.json();
        setCountries(data);
      } catch {
        showToast("Unable to load countries");
      }
    }

    loadCountries();
  }, []);

  function toggleAppearance() {
    const nextAppearance = appearance === "light" ? "dark" : "light";
    setAppearance(nextAppearance);
    showToast(
      nextAppearance === "dark" ? "Dark theme enabled" : "Light theme enabled"
    );
  }

  async function handleLogin(username, password) {
    try {
      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      setStoredToken(data.token);
      setToken(data.token);
      showToast(`Logged in as ${username}`);
      return true;
    } catch {
      showToast("Unable to login");
      return false;
    }
  }

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    showToast("Logged out");
  }

  async function handleAdd(name) {
    if (!hasRole(roles, "medals-post")) {
      showToast("You do not have permission to add countries");
      return false;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          gold: 0,
          silver: 0,
          bronze: 0,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const newCountry = await response.json();
      setCountries((prevCountries) => [...prevCountries, newCountry]);
      showToast(`${newCountry.name} added`);
      return true;
    } catch {
      showToast("Unable to add country");
      return false;
    }
  }

  async function handleDelete(id) {
    if (!hasRole(roles, "medals-delete")) {
      showToast("You do not have permission to delete countries");
      return;
    }

    const countryToDelete = countries.find((country) => country.id === id);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      setCountries((prevCountries) =>
        prevCountries.filter((country) => country.id !== id)
      );

      showToast(
        countryToDelete ? `${countryToDelete.name} deleted` : "Country deleted"
      );
    } catch {
      showToast("Unable to delete country");
    }
  }

  async function handleIncrement(countryId, medalName) {
    if (!hasRole(roles, "medals-patch")) {
      showToast("You do not have permission to update medals");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${countryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medalName,
          change: 1,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedCountry = await response.json();

      setCountries((prevCountries) =>
        prevCountries.map((country) =>
          country.id === countryId ? updatedCountry : country
        )
      );
    } catch {
      showToast("Unable to update medal");
    }
  }

  async function handleDecrement(countryId, medalName) {
    if (!hasRole(roles, "medals-patch")) {
      showToast("You do not have permission to update medals");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${countryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medalName,
          change: -1,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedCountry = await response.json();

      setCountries((prevCountries) =>
        prevCountries.map((country) =>
          country.id === countryId ? updatedCountry : country
        )
      );
    } catch {
      showToast("Unable to update medal");
    }
  }

  function getAllMedalsTotal() {
    let sum = 0;

    medals.current.forEach((medal) => {
      sum += countries.reduce((total, country) => total + country[medal.name], 0);
    });

    return sum;
  }

  return (
    <Toast.Provider swipeDirection="right">
      <Theme appearance={appearance}>
        <AppTooltip content="Toggle theme">
          <Button
            onClick={toggleAppearance}
            style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
            variant="ghost"
          >
            {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </AppTooltip>

        <Flex p="2" pl="8" className="fixedHeader" justify="between" align="center">
          <Heading size="6">
            Olympic Medals
            <Badge variant="outline" ml="2">
              <Heading size="6">{getAllMedalsTotal()}</Heading>
            </Badge>
          </Heading>

          <Flex gap="2" align="center">
            {username && <Text size="2">Hello, {username}</Text>}

            {hasRole(roles, "medals-post") && <NewCountry onAdd={handleAdd} />}

            {token ? (
              <AppTooltip content="Logout">
                <Button variant="soft" onClick={handleLogout}>
                  Logout
                </Button>
              </AppTooltip>
            ) : (
              <LoginDialog onLogin={handleLogin} />
            )}
          </Flex>
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
                canDelete={hasRole(roles, "medals-delete")}
                canPatch={hasRole(roles, "medals-patch")}
              />
            ))}
        </Grid>

        <Toast.Root className="toast-root" open={toastOpen} onOpenChange={setToastOpen}>
          <Toast.Title>{toastMessage}</Toast.Title>
        </Toast.Root>

        <Toast.Viewport className="toast-viewport" />
      </Theme>
    </Toast.Provider>
  );
}

export default App;