import React from "react";
import Heading from "../components/UI/Topography/Heading";
import { Paragraph } from "../components/UI/Topography/Paragraph";
import { Label } from "../components/UI/Topography/Label";
import { Button } from "../components/UI/Button/Button";
import { GoSearch } from "react-icons/go";
import { IoMdClose } from "react-icons/io";
import { InputField } from "../components/UI/Form/InputField";
import { Textarea } from "../components/UI/Form/Textarea";
import { Select } from "../components/UI/Form/Select";
import { RadioGroup } from "../components/UI/Form/RadioGroup";
import { FileUpload } from "../components/UI/Form/FileUpload";
import { ToggleSwitch } from "../components/UI/Form/ToggleSwitch";

const UIShowcase: React.FC = () => {
  const [textValue, setTextValue] = React.useState("");
  const [emailValue, setEmailValue] = React.useState("");
  const [passwordValue, setPasswordValue] = React.useState("");
  const [textareaValue, setTextareaValue] = React.useState("");
  const [selectValue, setSelectValue] = React.useState("");
  const [radioValue, setRadioValue] = React.useState("");
  const [fileValue, setFileValue] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState("");
  const [fileDisabled, setFileDisabled] = React.useState(false);
  const [fileRequired, setFileRequired] = React.useState(false);
  const [toggleValue, setToggleValue] = React.useState(false);
  const [toggleDisabled, setToggleDisabled] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* Page Title */}
      <Heading level={1} className="mb-6">
        UI Components Showcase
      </Heading>

      {/* Typography */}
      <section className="mb-8">
        <Heading level={2} className="mb-4" style="underline">
          Typography
        </Heading>
        {/** Headings */}
        <Heading level={1} className="mb-2">
          Heading 1
        </Heading>
        <Heading level={2} className="mb-2">
          Heading 2
        </Heading>
        <Heading level={3} className="mb-2">
          Heading 3
        </Heading>
        {/* Paragraphs */}
        <section className="mb-8">
          <Heading level={3} className="mb-4" style="underline">
            Paragraphs
          </Heading>
          <Paragraph size="sm" color="black" weight="normal" align="left">
            Small, black, normal weight, left aligned
          </Paragraph>
          <Paragraph size="md" color="gray" weight="medium" align="center">
            Medium, gray, medium weight, center aligned
          </Paragraph>
          <Paragraph
            size="lg"
            color="white"
            weight="bold"
            align="right"
            style="bg-gray-400"
          >
            Large, white, bold, right aligned (on black background)
          </Paragraph>
        </section>

        {/* Labels */}
        <section>
          <Heading level={3} className="mb-4" style="underline">
            Labels
          </Heading>

          <Label
            htmlFor="input1"
            size="sm"
            color="gray"
            weight="normal"
            align="left"
            style="mb-1 block"
          >
            Small gray label (for form field)
          </Label>
          <Label
            htmlFor="input2"
            size="md"
            color="black"
            weight="medium"
            align="left"
            style="mb-1 block"
          >
            Medium black label, medium weight
          </Label>
          <Label
            size="md"
            color="gray"
            weight="normal"
            align="center"
            style="mb-1 block"
          >
            Centered UI hint label
          </Label>
        </section>
      </section>

      {/* Buttons */}
      <section className="mb-8">
        <Heading level={2} className="mb-4" style="underline">
          Buttons
        </Heading>
        <div className="flex flex-col gap-4 max-w-md">
          <Button variant="primary" size="md">
            Primary Button
          </Button>
          <Button variant="secondary" size="md">
            Secondary Button
          </Button>
          <Button variant="outline" size="md">
            Outline Button
          </Button>
          <Button variant="outline" size="md" color="border-red-500">
            Red Outline Button
          </Button>
          <Button
            variant="primary"
            size="md"
            color="bg-green-500"
            icon={<GoSearch size={20} />}
          >
            Icon Button (Search)
          </Button>
          <Button variant="primary" size="md" icon={<IoMdClose size={20} />}>
            Icon Button (Close)
          </Button>
          <Button variant="primary" size="md" loading>
            Loading Button
          </Button>
          <Button variant="primary" size="lg" fullWidth>
            Full Width Button
          </Button>
          <Button variant="primary" size="sm" disabled>
            Disabled Button
          </Button>
        </div>
      </section>

      {/* Form Inputs */}
      <section className="mb-8">
        <Heading level={2} className="mb-4" style="underline">
          Inputs
        </Heading>

        {/* Text Inputs */}
        <div className="max-w-md space-y-6">
          <InputField
            type="text"
            label="Text Input"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Enter text..."
          />
          <InputField
            type="email"
            label="Email Input"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="Enter email..."
          />
          <InputField
            type="password"
            label="Password Input"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            placeholder="Enter password..."
          />
        </div>

        {/* Textarea Inputs */}
        <div className="max-w-md space-y-6">
          <Textarea
            label="Textarea Input"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Enter text..."
          />
        </div>

        {/* Select Inputs */}
        <div className="max-w-md space-y-6">
          <Select
            label="Select Input"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ]}
          />
          <Select
            label="Select Input"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ]}
          />
        </div>

        {/* Radio Inputs */}
        <div className="max-w-md space-y-6">
          <RadioGroup
            label="Radio Group"
            value={radioValue}
            onChange={(e) => setRadioValue(e.target.value)}
            options={[
              { value: "radio1", label: "Radio 1" },
              { value: "radio2", label: "Radio 2" },
              { value: "radio3", label: "Radio 3" },
            ]}
          />
        </div>

        {/* File Upload */}
        <div className="max-w-md space-y-6">
          <FileUpload
            label="File Upload"
            value={fileValue}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files[0]) {
                setFileValue(files[0]);
              }
            }}
            accept=".jpg,.jpeg,.png"
            error={fileError}
            disabled={fileDisabled}
            required={fileRequired}
          />
        </div>

        {/* Toggle Switch */}
        <div className="max-w-md space-y-6">
          <ToggleSwitch
            label="Toggle Switch"
            checked={toggleValue}
            onChange={(e) => setToggleValue(e.target.checked)}
            disabled={toggleDisabled}
          />
        </div>
      </section>

      {/* Modal Placeholder */}
      <section>
        <Heading level={2} className="mb-4" style="underline">
          Modal (Coming Soon)
        </Heading>
      </section>
    </div>
  );
};

export default UIShowcase;
