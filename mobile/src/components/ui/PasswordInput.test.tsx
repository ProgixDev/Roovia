import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("masks the value until the reveal toggle is pressed", async () => {
    await render(<PasswordInput testID="pw" value="hunter2" onChangeText={() => {}} />);

    expect(screen.getByTestId("pw").props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByLabelText("Show password"));

    expect(screen.getByTestId("pw").props.secureTextEntry).toBe(false);
  });

  it("masks the value again when the toggle is pressed twice", async () => {
    await render(<PasswordInput testID="pw" value="hunter2" onChangeText={() => {}} />);

    await fireEvent.press(screen.getByLabelText("Show password"));
    await fireEvent.press(screen.getByLabelText("Hide password"));

    expect(screen.getByTestId("pw").props.secureTextEntry).toBe(true);
  });

  // Each field owns its own reveal state: revealing the password on a form that
  // also has a confirm field must not unmask the confirm field too.
  it("keeps reveal state per field", async () => {
    await render(
      <>
        <PasswordInput testID="pw" value="hunter2" onChangeText={() => {}} />
        <PasswordInput testID="confirm" value="hunter2" onChangeText={() => {}} />
      </>,
    );

    await fireEvent.press(screen.getAllByLabelText("Show password")[0]);

    expect(screen.getByTestId("pw").props.secureTextEntry).toBe(false);
    expect(screen.getByTestId("confirm").props.secureTextEntry).toBe(true);
  });
});
