import { useState } from "react";
import { TopNavBar } from "../components/UI/TopNavBar";
import { Card } from "../components/UI/Card";
import {
  SectionTitle,
  Label,
  H1,
  H2,
  H3,
  Paragraph,
  Caption,
} from "../components/UI/Typography";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Select } from "../components/UI/Select";
import { Toggle } from "../components/UI/Toggle";
import { Chip } from "../components/UI/Chip";
import { TimeSlot } from "../components/UI/TimeSlot";
import { Badge, PillBadge } from "../components/UI/Badge";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Checkbox } from "../components/UI/Form/Checkbox";
import { FileUpload } from "../components/UI/Form/FileUpload";
import { RadioGroup } from "../components/UI/Form/RadioGroup";
import { Select as FormSelect } from "../components/UI/Form/Select";
import { Textarea } from "../components/UI/Form/Textarea";
import { SelectableGroup } from "../components/UI/SelectableGroup";

export default function UIShowcasePage() {
  const [push, setPush] = useState(true);
  const [category, setCategory] = useState("barbershop");
  const [checked, setChecked] = useState(false);
  const [contactMethod, setContactMethod] = useState("email");
  const [notes, setNotes] = useState("");

  type Filter = "haircut" | "massage" | "facial" | "yoga";
  const [filter, setFilter] = useState<Filter>("haircut");

  type Slot = "09:00" | "10:30" | "11:45";
  const [slot, setSlot] = useState<Slot>("09:00");

  return (
    <div className="min-h-screen bg-background-light font-display text-[#111418] dark:bg-background-dark dark:text-gray-100">
      <TopNavBar
        title="BizSlot UI Style Guide"
        version="v1.0.0"
        onBack={() => history.back()}
      />

      <div className="mx-auto max-w-lg pb-20">
        {/* 1. Typography */}
        <section className="mt-4">
          <SectionTitle>1. Typography</SectionTitle>

          <div className="space-y-1 bg-white p-4 dark:bg-gray-900/50">
            <div>
              <Label>Headline H1 - 32px Bold</Label>
              <H1>BizSlot App</H1>
            </div>

            <div className="pt-4">
              <Label>Headline H2 - 28px Bold</Label>
              <H2>Book an Appointment</H2>
            </div>

            <div className="pt-4">
              <Label>Headline H3 - 24px Bold</Label>
              <H3>Service Details</H3>
            </div>

            <div className="pt-4">
              <Label>Body Text - 16px Regular</Label>
              <Paragraph>
                BizSlot connects clients with professionals. Easily manage your
                schedule and appointments in one place.
              </Paragraph>
            </div>

            <div className="pt-4">
              <Label>Caption - 12px Medium</Label>
              <Caption>Last updated: Oct 24, 2023</Caption>
            </div>
          </div>
        </section>

        {/* 2. Color Palette */}
        <section>
          <SectionTitle>2. Color Palette</SectionTitle>

          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="space-y-2">
              <div className="flex h-16 w-full items-end rounded-lg bg-primary p-2">
                <span className="text-[10px] font-bold text-white">
                  PRIMARY (#197fe6)
                </span>
              </div>
              <div className="flex h-16 w-full items-end rounded-lg bg-success p-2">
                <span className="text-[10px] font-bold text-white">
                  SUCCESS (#10b981)
                </span>
              </div>
              <div className="flex h-16 w-full items-end rounded-lg bg-warning p-2">
                <span className="text-[10px] font-bold text-white">
                  WARNING (#f59e0b)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-16 w-full items-end rounded-lg bg-danger p-2">
                <span className="text-[10px] font-bold text-white">
                  DANGER (#ef4444)
                </span>
              </div>
              <div className="flex h-16 w-full items-end rounded-lg border border-gray-200 bg-background-light p-2">
                <span className="text-[10px] font-bold text-gray-600">
                  BG LIGHT (#f6f7f8)
                </span>
              </div>
              <div className="flex h-16 w-full items-end rounded-lg border border-gray-700 bg-background-dark p-2">
                <span className="text-[10px] font-bold text-gray-400">
                  BG DARK (#111921)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section>
          <SectionTitle>3. Buttons</SectionTitle>

          <div className="space-y-4 p-4">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline / Ghost</Button>
            <Button disabled>Disabled State</Button>
            <Button isLoading>Loading State</Button>
          </div>
        </section>

        {/* 4. Form Elements */}
        <section>
          <SectionTitle>4. Form Elements</SectionTitle>

          <div className="space-y-4 p-4">
            <Input label="Full Name" placeholder="John Doe" />
            <Select
              label="Service Category"
              value={category}
              onChange={setCategory}
              options={[
                { value: "barbershop", label: "Barbershop" },
                { value: "nail", label: "Nail Salon" },
                { value: "consulting", label: "Consulting" },
              ]}
            />

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-[#111418] dark:text-gray-200">
                Push Notifications
              </span>
              <Toggle
                checked={push}
                onChange={setPush}
                selectedColor="bg-black"
              />
            </div>

            {/* Checkbox */}
            <Checkbox
              label="I agree to the Terms and Conditions"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />

            {/* File Upload */}
            <FileUpload
              label="Upload Profile Picture"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                console.log("Selected file:", file);
              }}
              accept="image/*"
            />

            {/* Radio Buttons */}
            <RadioGroup
              label="Choose your preferred contact method"
              options={[
                { label: "Email", value: "email" },
                { label: "Phone", value: "phone" },
                { label: "SMS", value: "sms" },
              ]}
              value={contactMethod}
              onChange={(e) => {
                setContactMethod(e.target.value);
                console.log("Selected contact method:", e.target.value);
              }}
            />

            {/* Textarea */}
            <Textarea
              label="Additional Notes"
              placeholder="Enter any special requests or information here..."
              value={notes}
              onChange={(e) => {
                console.log("Textarea content:", e.target.value);
                setNotes(e.target.value);
              }}
            />
          </div>
        </section>

        {/* 5. Selection UI */}
        <section>
          <SectionTitle>5. Selection UI</SectionTitle>

          <div className="p-4">
            <p className="mb-3 text-sm font-semibold text-[#111418] dark:text-gray-200">
              Popular Filters
            </p>
            <SelectableGroup<Filter>
              label="Popular Filters"
              mode="multi"
              value={filter}
              onChange={(v) => setFilter(v as Filter)}
              options={[
                { value: "haircut", label: "Haircut" },
                { value: "massage", label: "Massage" },
                { value: "facial", label: "Facial" },
                { value: "yoga", label: "Yoga" },
              ]}
              className="p-4"
              renderItem={({ option, selected, toggle }) => (
                <span key={option.value} className="mr-2 inline-block mb-2">
                  <Chip selected={selected} onClick={toggle}>
                    {option.label}
                  </Chip>
                </span>
              )}
            />

            <p className="mb-3 mt-6 text-sm font-semibold text-[#111418] dark:text-gray-200">
              Available Time Slots
            </p>
            <SelectableGroup<Slot>
              label="Available Time Slots"
              mode="single"
              value={slot}
              onChange={(v) => setSlot(v as Slot)}
              options={[
                { value: "09:00", label: "09:00 AM" },
                { value: "10:30", label: "10:30 AM" },
                { value: "11:45", label: "11:45 AM" },
              ]}
              className="p-4"
              renderItem={({ option, selected, toggle }) => (
                <span key={option.value} className="inline-block w-1/3 pr-2">
                  <TimeSlot
                    selected={selected}
                    onClick={toggle}
                    className="w-full"
                  >
                    {option.label}
                  </TimeSlot>
                </span>
              )}
            />
          </div>
        </section>

        {/* 6. Component Blocks */}
        <section>
          <SectionTitle>6. Component Blocks</SectionTitle>

          <div className="space-y-6 p-4">
            {/* Business Card (built from Card + regular HTML layout) */}
            <Card className="overflow-hidden">
              <div className="relative h-32 w-full bg-gradient-to-r from-primary to-blue-400">
                <img
                  className="h-full w-full object-cover mix-blend-overlay"
                  alt="Interior of a modern barbershop with leather chairs"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Wc4aj59UpfYHDc54507r3t6wcAoPAv1DoQQzrwQWT0xGJsmlBO5Q6r7f45wjEkOft7LODk2aIayoO7EmQk9by1eraPWhGvm0he_LWbx2RDKMzU5bSVo2srWNdqJFeU072acJz6xExLgpGwdnfFVNpj5-wue7piby_3uJaC0SL2mZunORVwEWE1813rHxvA_CjfyU4Qr8wwoAT83dTTdkRGF9o_oubcEceBME--CNzzc2NOaYnGEqUCIw7svfIQzi7LEasqa8uw"
                />

                <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-bold dark:bg-black/50">
                  <MaterialIcon
                    name="star"
                    className="!text-xs text-yellow-500"
                  />{" "}
                  4.9
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-lg font-bold dark:text-white">
                  Royal Cuts Barber Shop
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Downtown • 1.2 miles away
                </p>
              </div>
            </Card>

            {/* Appointment Card */}
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <MaterialIcon
                    name="event_upcoming"
                    className="text-primary"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Tomorrow, 10:30 AM
                  </p>
                  <h4 className="text-sm font-bold dark:text-white">
                    Men&apos;s Classic Haircut
                  </h4>
                </div>
              </div>

              <PillBadge variant="confirmed">Confirmed</PillBadge>
            </Card>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="pending">PENDING</Badge>
              <Badge variant="active">ACTIVE</Badge>
              <Badge variant="cancelled">CANCELLED</Badge>
              <Badge variant="rescheduled">RESCHEDULED</Badge>
            </div>
          </div>
        </section>

        {/* 7. Other */}
        <section>
          <SectionTitle>7. Other </SectionTitle>

          <div className="space-y-6 p-4">
            {/* Select Dropdown */}
            <FormSelect
              label="Choose your preferred contact method"
              options={[
                { label: "Email", value: "email" },
                { label: "Phone", value: "phone" },
                { label: "SMS", value: "sms" },
              ]}
              value={contactMethod}
              onChange={(e) => {
                setContactMethod(e.target.value);
                console.log("Selected contact method:", e.target.value);
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
