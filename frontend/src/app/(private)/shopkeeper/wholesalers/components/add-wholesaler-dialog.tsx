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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from "@/components/ui/sheet";
import api from "@/config/axios";
import { toast } from "sonner";
import { wholesalerSchema } from "@/schemas/wholesaler.schema";
import { useMediaQuery } from "@/hooks/use-media-query";

interface WholesalerFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

function WholesalerForm({ onSuccess, onCancel }: WholesalerFormProps) {
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/wholesalers", data);
            return response.data;
        },
        onSuccess: () => {
            onSuccess();
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
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mt-4 pb-4 md:pb-0">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm md:text-base">
                    Wholesaler Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Enter wholesaler name"
                    required
                    className="h-10 md:h-11 text-base md:text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm md:text-base">
                        Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91"
                        required
                        className="h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="text-sm md:text-base">WhatsApp</Label>
                    <Input
                        id="whatsappNumber"
                        name="whatsappNumber"
                        type="tel"
                        placeholder="+91"
                        className="h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address" className="text-sm md:text-base">
                    Address <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="address"
                    name="address"
                    placeholder="Enter complete address"
                    required
                    className="h-10 md:h-11 text-base md:text-sm"
                />
            </div>

            <div className="border-t pt-4">
                <div className="space-y-2">
                    <Label
                        htmlFor="initialPurchased"
                        className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm md:text-base"
                    >
                        Opening Balance (Optional)
                        <span className="text-xs text-slate-500 font-normal">
                            - Total purchased before using app
                        </span>
                    </Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="initialPurchased"
                            name="initialPurchased"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-10 h-10 md:h-11 text-base md:text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-10 md:h-11 text-base md:text-sm"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 h-10 md:h-11 text-base md:text-sm font-medium"
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? "Creating..." : "Add Wholesaler"}
                </Button>
            </div>
        </form>
    );
}

export function AddWholesalerDialog() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const onSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["wholesalers"] });
        setIsOpen(false);
    };

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:shadow-lg transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Wholesaler
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Wholesaler</DialogTitle>
                        <DialogDescription>
                            Create a new wholesaler account.
                        </DialogDescription>
                    </DialogHeader>
                    <WholesalerForm onSuccess={onSuccess} onCancel={() => setIsOpen(false)} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Wholesaler
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[20px] max-h-[90vh] overflow-y-auto px-4 md:px-6">
                <SheetHeader className="text-left md:text-center mt-2">
                    <SheetTitle>Add New Wholesaler</SheetTitle>
                    <SheetDescription>
                        Create a new account and record initial balance.
                    </SheetDescription>
                </SheetHeader>
                <WholesalerForm onSuccess={onSuccess} onCancel={() => setIsOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}
