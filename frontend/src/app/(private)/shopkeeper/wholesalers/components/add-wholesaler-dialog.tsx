"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import api from "@/config/axios";
import { toast } from "sonner";
import { wholesalerSchema } from "@/schemas/wholesaler.schema";

export function AddWholesalerDialog() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/wholesalers", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wholesalers"] });
            setIsOpen(false);
            toast.success("Wholesaler created successfully");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to create wholesaler",
            );
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const initialPurchasedValue = formData.get("initialPurchased") as string;

        const rawData: any = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            whatsappNumber: formData.get("whatsappNumber"),
            address: formData.get("address"),
        };

        // Handle number conversion
        if (initialPurchasedValue && !isNaN(parseFloat(initialPurchasedValue))) {
            rawData.initialPurchased = parseFloat(initialPurchasedValue);
        }

        const validation = wholesalerSchema.safeParse(rawData);

        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            return;
        }

        createMutation.mutate(validation.data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Wholesaler
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Wholesaler</DialogTitle>
                    <DialogDescription>
                        Create a new wholesaler account. You can optionally record any
                        advance payment made.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Wholesaler Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter wholesaler name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+91"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">WhatsApp</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                type="tel"
                                placeholder="+91"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">
                            Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Enter complete address"
                            required
                        />
                    </div>

                    <div className="border-t pt-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="initialPurchased"
                                className="flex items-center gap-2"
                            >
                                Opening Balance (Optional)
                                <span className="text-xs text-gray-500 font-normal">
                                    - Total purchased before using app
                                </span>
                            </Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="initialPurchased"
                                    name="initialPurchased"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Enter the total amount purchased from this wholesaler before
                                using this app. This will be recorded as outstanding debt to be
                                paid.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Creating..." : "Add Wholesaler"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
