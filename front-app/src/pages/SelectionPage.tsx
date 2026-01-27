import React from "react";
import { useNavigate } from "react-router-dom";
import { SelectionCard } from "../components/UI/SelectionCard";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { MOCK_ACCOUNT_TYPES } from "../constants/mockData";

/**
 * SelectionPage - User type selection landing page
 * Allows users to choose between Business Owner or Customer flow
 */
const SelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#f0f7ff] dark:bg-background-dark">
      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 justify-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-tight">
            How would you like to use BizSlot?
          </h1>
          <p className="text-[#4e7397] dark:text-gray-400 text-base">
            Select your account type to get started.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <SelectionCard
            icon={
              <div
                className={
                  MOCK_ACCOUNT_TYPES.businessOwner.iconBgColor +
                  " p-3 rounded-xl"
                }
              >
                <MaterialIcon
                  name={MOCK_ACCOUNT_TYPES.businessOwner.iconName}
                  className={`${MOCK_ACCOUNT_TYPES.businessOwner.iconColor} !text-4xl`}
                />
              </div>
            }
            title={MOCK_ACCOUNT_TYPES.businessOwner.title}
            description={MOCK_ACCOUNT_TYPES.businessOwner.description}
            buttonLabel={MOCK_ACCOUNT_TYPES.businessOwner.buttonLabel}
            buttonVariant="primary"
            onClick={() => navigate("/business-owner")}
          />

          <SelectionCard
            icon={
              <div
                className={
                  MOCK_ACCOUNT_TYPES.customer.iconBgColor + " p-3 rounded-xl"
                }
              >
                <MaterialIcon
                  name={MOCK_ACCOUNT_TYPES.customer.iconName}
                  className={`${MOCK_ACCOUNT_TYPES.customer.iconColor} !text-4xl`}
                />
              </div>
            }
            title={MOCK_ACCOUNT_TYPES.customer.title}
            description={MOCK_ACCOUNT_TYPES.customer.description}
            buttonLabel={MOCK_ACCOUNT_TYPES.customer.buttonLabel}
            buttonVariant="dark"
            onClick={() => navigate("/customer")}
          />
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-[#4e7397] dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default SelectionPage;
