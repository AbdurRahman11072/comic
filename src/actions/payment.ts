"use server";

import { env } from "@/env";
import { cookies } from "next/headers";

export const CreateCheckoutSessionAction = async (packageId: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/payments/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ packageId }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: "Failed to initiate payment" };
  }
};

export const DemoPayWebhookAction = async (userId: string, packageId: string, points: number) => {
  try {
    const payload = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_test_mock_${Date.now()}`,
          metadata: {
            userId,
            packageId,
            points: points.toString(),
          },
        },
      },
    };

    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/payments/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "mock-signature",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, message: errorText || "Webhook call failed" };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to trigger mock webhook" };
  }
};
